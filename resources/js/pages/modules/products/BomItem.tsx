import React, { FormEvent, useMemo, useState } from "react";
import { Head, router, useForm, usePage } from "@inertiajs/react";

import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormHelperText,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import AppLayout from "@/layouts/app-layout";
import type { BreadcrumbItem } from "@/types";

type FactoryOption = {
    id: number;
    name: string;
    code: string;
};

type ProductOption = {
    id: number;
    factory_id: number;
    sku: string;
    name: string;
};

type BomItemRow = {
    id: number;
    factory_id: number;
    fg_product_id: number;
    raw_product_id: number;
    qty_per_unit: string | number;
    waste_percent: string | number;
    notes?: string | null;
    factory?: {
        id: number;
        name: string;
        code: string;
    };
    fg_product?: {
        id: number;
        factory_id: number;
        type: string;
        sku: string;
        name: string;
    };
    raw_product?: {
        id: number;
        factory_id: number;
        type: string;
        sku: string;
        name: string;
    };
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type BomItemsPageProps = {
    bomItems: {
        data: BomItemRow[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
        links: PaginationLink[];
    };
    factories: FactoryOption[];
    fgProducts: ProductOption[];
    rawProducts: ProductOption[];
    filters: {
        q?: string;
        factory_id?: number | string;
    };
};

type PageProps = {
    flash?: {
        success?: string;
        error?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "BOM Items",
        href: "/bom-items",
    },
];

const defaultFormData = {
    factory_id: "",
    fg_product_id: "",
    raw_product_id: "",
    qty_per_unit: "0",
    waste_percent: "0",
    notes: "",
};

export default function Index({
                                  bomItems,
                                  factories,
                                  fgProducts,
                                  rawProducts,
                                  filters,
                              }: BomItemsPageProps) {
    const { flash } = usePage<PageProps>().props;

    const [search, setSearch] = useState(filters?.q || "");
    const [searchFactoryId, setSearchFactoryId] = useState(filters?.factory_id ?? "");

    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editingRow, setEditingRow] = useState<BomItemRow | null>(null);

    const createForm = useForm({
        factory_id: "",
        fg_product_id: "",
        raw_product_id: "",
        qty_per_unit: "0",
        waste_percent: "0",
        notes: "",
    });

    const editForm = useForm({
        factory_id: "",
        fg_product_id: "",
        raw_product_id: "",
        qty_per_unit: "0",
        waste_percent: "0",
        notes: "",
    });

    const openCreateModal = () => {
        createForm.setData(defaultFormData);
        createForm.clearErrors();
        setOpenCreate(true);
    };

    const closeCreateModal = () => {
        setOpenCreate(false);
        createForm.reset();
        createForm.clearErrors();
    };

    const openEditModal = (row: BomItemRow) => {
        setEditingRow(row);
        editForm.setData({
            factory_id: String(row.factory_id ?? ""),
            fg_product_id: String(row.fg_product_id ?? ""),
            raw_product_id: String(row.raw_product_id ?? ""),
            qty_per_unit: String(row.qty_per_unit ?? "0"),
            waste_percent: String(row.waste_percent ?? "0"),
            notes: row.notes || "",
        });
        editForm.clearErrors();
        setOpenEdit(true);
    };

    const closeEditModal = () => {
        setOpenEdit(false);
        setEditingRow(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const submitSearch = (e: FormEvent) => {
        e.preventDefault();

        router.get(
            "/bom-items",
            {
                q: search,
                factory_id: searchFactoryId,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const resetSearch = () => {
        setSearch("");
        setSearchFactoryId("");

        router.get(
            "/bom-items",
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const submitCreate = (e: FormEvent) => {
        e.preventDefault();

        createForm.post("/bom-items", {
            preserveScroll: true,
            onSuccess: () => {
                closeCreateModal();
            },
        });
    };

    const submitEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!editingRow) return;

        editForm.put(`/bom-items/${editingRow.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                closeEditModal();
            },
        });
    };

    const handleDelete = (row: BomItemRow) => {
        const fgName = row.fg_product?.name || "this FG";
        const rawName = row.raw_product?.name || "this RAW";

        if (!confirm(`Are you sure you want to delete BOM item "${fgName} -> ${rawName}"?`)) {
            return;
        }

        router.delete(`/bom-items/${row.id}`, {
            preserveScroll: true,
        });
    };

    const paginationLinks = useMemo(() => {
        return bomItems?.links || [];
    }, [bomItems]);

    const selectedCreateFactoryId = Number(createForm.data.factory_id || 0);
    const selectedEditFactoryId = Number(editForm.data.factory_id || 0);

    const filteredCreateFgProducts = fgProducts.filter(
        (item) => Number(item.factory_id) === selectedCreateFactoryId
    );

    const filteredCreateRawProducts = rawProducts.filter(
        (item) => Number(item.factory_id) === selectedCreateFactoryId
    );

    const filteredEditFgProducts = fgProducts.filter(
        (item) => Number(item.factory_id) === selectedEditFactoryId
    );

    const filteredEditRawProducts = rawProducts.filter(
        (item) => Number(item.factory_id) === selectedEditFactoryId
    );

    console.log("create factory id:", createForm.data.factory_id);
    console.log("fgProducts:", fgProducts);
    console.log("rawProducts:", rawProducts);
    console.log("filteredCreateFgProducts:", filteredCreateFgProducts);
    console.log("filteredCreateRawProducts:", filteredCreateRawProducts);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="BOM Items" />

            <Box sx={{ p: 3 }}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        alignItems={{ xs: "stretch", md: "center" }}
                        justifyContent="space-between"
                        spacing={2}
                        mb={3}
                    >
                        <Box>
                            <Typography variant="h4" fontWeight={700}>
                                BOM Item Management
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Create, update, search and delete BOM items
                            </Typography>
                        </Box>

                        <Button variant="contained" onClick={openCreateModal}>
                            Add BOM Item
                        </Button>
                    </Stack>

                    {(flash?.success || flash?.error) && (
                        <Stack spacing={2} mb={3}>
                            {flash?.success && <Alert severity="success">{flash.success}</Alert>}
                            {flash?.error && <Alert severity="error">{flash.error}</Alert>}
                        </Stack>
                    )}

                    <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                        <form onSubmit={submitSearch}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Search by FG, RAW, SKU or notes"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Factory</InputLabel>
                                        <Select
                                            label="Factory"
                                            value={searchFactoryId}
                                            onChange={(e) => setSearchFactoryId(e.target.value)}
                                        >
                                            <MenuItem value="">All</MenuItem>
                                            {factories.map((factory) => (
                                                <MenuItem key={factory.id} value={factory.id}>
                                                    {factory.name} ({factory.code})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                    <Button
                                        fullWidth
                                        type="submit"
                                        variant="contained"
                                        startIcon={<SearchIcon />}
                                        sx={{ height: 56 }}
                                    >
                                        Search
                                    </Button>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                    <Button
                                        fullWidth
                                        type="button"
                                        variant="outlined"
                                        startIcon={<RestartAltIcon />}
                                        onClick={resetSearch}
                                        sx={{ height: 56 }}
                                    >
                                        Reset
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>

                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell width={70}>ID</TableCell>
                                    <TableCell>Factory</TableCell>
                                    <TableCell>FG Product</TableCell>
                                    <TableCell>RAW Product</TableCell>
                                    <TableCell width={120}>Qty / Unit</TableCell>
                                    <TableCell width={120}>Waste %</TableCell>
                                    <TableCell>Notes</TableCell>
                                    <TableCell align="right" width={150}>
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {bomItems.data.length > 0 ? (
                                    bomItems.data.map((row) => (
                                        <TableRow key={row.id} hover>
                                            <TableCell>{row.id}</TableCell>
                                            <TableCell>
                                                {row.factory ? `${row.factory.name} (${row.factory.code})` : "-"}
                                            </TableCell>
                                            <TableCell>
                                                {row.fg_product
                                                    ? `${row.fg_product.name} (${row.fg_product.sku})`
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>
                                                {row.raw_product
                                                    ? `${row.raw_product.name} (${row.raw_product.sku})`
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>{row.qty_per_unit}</TableCell>
                                            <TableCell>{row.waste_percent}</TableCell>
                                            <TableCell>{row.notes || "-"}</TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => openEditModal(row)}
                                                >
                                                    <EditIcon />
                                                </IconButton>

                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDelete(row)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            <Typography py={3} color="text.secondary">
                                                No BOM items found.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "center" }}
                        spacing={2}
                        mt={3}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Showing {bomItems.from ?? 0} to {bomItems.to ?? 0} of {bomItems.total} entries
                        </Typography>

                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {paginationLinks.map((link, index) => {
                                const label = link.label
                                    .replace("&laquo; Previous", "Previous")
                                    .replace("Next &raquo;", "Next")
                                    .replace("&laquo;", "")
                                    .replace("&raquo;", "");

                                return (
                                    <Button
                                        key={index}
                                        size="small"
                                        variant={link.active ? "contained" : "outlined"}
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                router.visit(link.url, {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                });
                                            }
                                        }}
                                    >
                                        {label}
                                    </Button>
                                );
                            })}
                        </Stack>
                    </Stack>
                </Paper>
            </Box>

            <Dialog open={openCreate} onClose={closeCreateModal} fullWidth maxWidth="md">
                <DialogTitle>Add BOM Item</DialogTitle>
                <form onSubmit={submitCreate}>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth error={!!createForm.errors.factory_id}>
                                    <InputLabel>Factory</InputLabel>
                                    <Select
                                        label="Factory"
                                        value={createForm.data.factory_id}
                                        onChange={(e) => {
                                            createForm.setData({
                                                ...createForm.data,
                                                factory_id: String(e.target.value),
                                                fg_product_id: "",
                                                raw_product_id: "",
                                            });
                                        }}
                                    >
                                        {factories.map((factory) => (
                                            <MenuItem key={factory.id} value={factory.id}>
                                                {factory.name} ({factory.code})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{createForm.errors.factory_id}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl
                                    fullWidth
                                    error={!!createForm.errors.fg_product_id}
                                    disabled={!createForm.data.factory_id}
                                >
                                    <InputLabel>FG Product</InputLabel>
                                    <Select
                                        label="FG Product"
                                        value={createForm.data.fg_product_id}
                                        onChange={(e) => createForm.setData("fg_product_id", String(e.target.value))}
                                    >
                                        {filteredCreateFgProducts.length > 0 ? (
                                            filteredCreateFgProducts.map((product) => (
                                                <MenuItem key={product.id} value={String(product.id)}>
                                                    {product.name} ({product.sku})
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled value="">
                                                {createForm.data.factory_id
                                                    ? "No FG products found for this factory"
                                                    : "Select factory first"}
                                            </MenuItem>
                                        )}
                                    </Select>
                                    <FormHelperText>{createForm.errors.fg_product_id}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl
                                    fullWidth
                                    error={!!createForm.errors.raw_product_id}
                                    disabled={!createForm.data.factory_id}
                                >
                                    <InputLabel>RAW Product</InputLabel>
                                    <Select
                                        label="RAW Product"
                                        value={createForm.data.raw_product_id}
                                        onChange={(e) => createForm.setData("raw_product_id", String(e.target.value))}
                                    >
                                        {filteredCreateRawProducts.length > 0 ? (
                                            filteredCreateRawProducts.map((product) => (
                                                <MenuItem key={product.id} value={String(product.id)}>
                                                    {product.name} ({product.sku})
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled value="">
                                                {createForm.data.factory_id
                                                    ? "No RAW products found for this factory"
                                                    : "Select factory first"}
                                            </MenuItem>
                                        )}
                                    </Select>
                                    <FormHelperText>{createForm.errors.raw_product_id}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Qty Per Unit"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={createForm.data.qty_per_unit}
                                    onChange={(e) => createForm.setData("qty_per_unit", e.target.value)}
                                    error={!!createForm.errors.qty_per_unit}
                                    helperText={createForm.errors.qty_per_unit}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Waste Percent"
                                    type="number"
                                    inputProps={{ step: "0.001", min: 0 }}
                                    value={createForm.data.waste_percent}
                                    onChange={(e) => createForm.setData("waste_percent", e.target.value)}
                                    error={!!createForm.errors.waste_percent}
                                    helperText={createForm.errors.waste_percent}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label="Notes"
                                    value={createForm.data.notes}
                                    onChange={(e) => createForm.setData("notes", e.target.value)}
                                    error={!!createForm.errors.notes}
                                    helperText={createForm.errors.notes}
                                    fullWidth
                                    multiline
                                    minRows={3}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={closeCreateModal}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={createForm.processing}>
                            {createForm.processing ? "Saving..." : "Save"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={openEdit} onClose={closeEditModal} fullWidth maxWidth="md">
                <DialogTitle>Edit BOM Item</DialogTitle>
                <form onSubmit={submitEdit}>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth error={!!editForm.errors.factory_id}>
                                    <InputLabel>Factory</InputLabel>
                                    <Select
                                        label="Factory"
                                        value={editForm.data.factory_id}
                                        onChange={(e) => {
                                            editForm.setData({
                                                ...editForm.data,
                                                factory_id: String(e.target.value),
                                                fg_product_id: "",
                                                raw_product_id: "",
                                            });
                                        }}
                                    >
                                        {factories.map((factory) => (
                                            <MenuItem key={factory.id} value={factory.id}>
                                                {factory.name} ({factory.code})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{editForm.errors.factory_id}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl
                                    fullWidth
                                    error={!!createForm.errors.fg_product_id}
                                    disabled={!createForm.data.factory_id}
                                >
                                    <InputLabel>FG Product</InputLabel>
                                    <Select
                                        label="FG Product"
                                        value={createForm.data.fg_product_id}
                                        onChange={(e) => createForm.setData("fg_product_id", String(e.target.value))}
                                    >
                                        {filteredCreateFgProducts.length > 0 ? (
                                            filteredCreateFgProducts.map((product) => (
                                                <MenuItem key={product.id} value={String(product.id)}>
                                                    {product.name} ({product.sku})
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled value="">
                                                {createForm.data.factory_id
                                                    ? "No FG products found for this factory"
                                                    : "Select factory first"}
                                            </MenuItem>
                                        )}
                                    </Select>
                                    <FormHelperText>{createForm.errors.fg_product_id}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl
                                    fullWidth
                                    error={!!createForm.errors.raw_product_id}
                                    disabled={!createForm.data.factory_id}
                                >
                                    <InputLabel>RAW Product</InputLabel>
                                    <Select
                                        label="RAW Product"
                                        value={createForm.data.raw_product_id}
                                        onChange={(e) => createForm.setData("raw_product_id", String(e.target.value))}
                                    >
                                        {filteredCreateRawProducts.length > 0 ? (
                                            filteredCreateRawProducts.map((product) => (
                                                <MenuItem key={product.id} value={String(product.id)}>
                                                    {product.name} ({product.sku})
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled value="">
                                                {createForm.data.factory_id
                                                    ? "No RAW products found for this factory"
                                                    : "Select factory first"}
                                            </MenuItem>
                                        )}
                                    </Select>
                                    <FormHelperText>{createForm.errors.raw_product_id}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Qty Per Unit"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={editForm.data.qty_per_unit}
                                    onChange={(e) => editForm.setData("qty_per_unit", e.target.value)}
                                    error={!!editForm.errors.qty_per_unit}
                                    helperText={editForm.errors.qty_per_unit}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Waste Percent"
                                    type="number"
                                    inputProps={{ step: "0.001", min: 0 }}
                                    value={editForm.data.waste_percent}
                                    onChange={(e) => editForm.setData("waste_percent", e.target.value)}
                                    error={!!editForm.errors.waste_percent}
                                    helperText={editForm.errors.waste_percent}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label="Notes"
                                    value={editForm.data.notes}
                                    onChange={(e) => editForm.setData("notes", e.target.value)}
                                    error={!!editForm.errors.notes}
                                    helperText={editForm.errors.notes}
                                    fullWidth
                                    multiline
                                    minRows={3}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={closeEditModal}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={editForm.processing}>
                            {editForm.processing ? "Updating..." : "Update"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </AppLayout>
    );
}
