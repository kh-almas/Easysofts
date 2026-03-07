import React, { FormEvent, useMemo, useState } from "react";
import { Head, router, useForm, usePage } from "@inertiajs/react";

import {
    Alert,
    Box,
    Button,
    Chip,
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

type ProductRow = {
    id: number;
    factory_id: number;
    type: "RAW" | "FG";
    sku: string;
    name: string;
    uom: string;
    is_active: number;
    avg_cost: string | number;
    last_cost: string | number;
    standard_bom_cost: string | number;
    created_at?: string;
    updated_at?: string;
    factory?: {
        id: number;
        name: string;
        code: string;
    };
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type ProductsPageProps = {
    products: {
        data: ProductRow[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
        links: PaginationLink[];
    };
    factories: FactoryOption[];
    filters: {
        q?: string;
        factory_id?: number | string;
        type?: string;
        is_active?: number | string;
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
        title: "Products",
        href: "/products",
    },
];

const defaultFormData = {
    factory_id: "",
    type: "RAW",
    sku: "",
    name: "",
    uom: "",
    is_active: 1,
    avg_cost: "0",
    last_cost: "0",
    standard_bom_cost: "0",
};

export default function Index({ products, factories, filters }: ProductsPageProps) {
    const { flash } = usePage<PageProps>().props;

    const [search, setSearch] = useState(filters?.q || "");
    const [searchFactoryId, setSearchFactoryId] = useState(filters?.factory_id ?? "");
    const [searchType, setSearchType] = useState(filters?.type || "");
    const [searchStatus, setSearchStatus] = useState(filters?.is_active ?? "");

    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editingRow, setEditingRow] = useState<ProductRow | null>(null);

    const createForm = useForm({
        factory_id: "",
        type: "RAW",
        sku: "",
        name: "",
        uom: "",
        is_active: 1,
        avg_cost: "0",
        last_cost: "0",
        standard_bom_cost: "0",
    });

    const editForm = useForm({
        factory_id: "",
        type: "RAW",
        sku: "",
        name: "",
        uom: "",
        is_active: 1,
        avg_cost: "0",
        last_cost: "0",
        standard_bom_cost: "0",
    });

    const activeLabel = (status: number) => (status === 1 ? "Active" : "Inactive");

    const activeColor = (status: number): "success" | "default" => {
        return status === 1 ? "success" : "default";
    };

    const typeColor = (type: string): "primary" | "warning" => {
        return type === "FG" ? "primary" : "warning";
    };

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

    const openEditModal = (row: ProductRow) => {
        setEditingRow(row);
        editForm.setData({
            factory_id: String(row.factory_id ?? ""),
            type: row.type || "RAW",
            sku: row.sku || "",
            name: row.name || "",
            uom: row.uom || "",
            is_active: Number(row.is_active) === 1 ? 1 : 0,
            avg_cost: String(row.avg_cost ?? "0"),
            last_cost: String(row.last_cost ?? "0"),
            standard_bom_cost: String(row.standard_bom_cost ?? "0"),
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
            "/products",
            {
                q: search,
                factory_id: searchFactoryId,
                type: searchType,
                is_active: searchStatus,
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
        setSearchType("");
        setSearchStatus("");

        router.get(
            "/products",
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const submitCreate = (e: FormEvent) => {
        e.preventDefault();

        createForm.post("/products", {
            preserveScroll: true,
            onSuccess: () => {
                closeCreateModal();
            },
        });
    };

    const submitEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!editingRow) return;

        editForm.put(`/products/${editingRow.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                closeEditModal();
            },
        });
    };

    const handleDelete = (row: ProductRow) => {
        if (!confirm(`Are you sure you want to delete "${row.name}"?`)) return;

        router.delete(`/products/${row.id}`, {
            preserveScroll: true,
        });
    };

    const paginationLinks = useMemo(() => {
        return products?.links || [];
    }, [products]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

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
                                Product Management
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Create, update, search and delete products
                            </Typography>
                        </Box>

                        <Button variant="contained" onClick={openCreateModal}>
                            Add Product
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
                                <Grid size={{ xs: 12, md: 12 }}>
                                    <TextField
                                        fullWidth
                                        label="Search by name, SKU or UOM"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Type</InputLabel>
                                        <Select
                                            label="Type"
                                            value={searchType}
                                            onChange={(e) => setSearchType(e.target.value)}
                                        >
                                            <MenuItem value="">All</MenuItem>
                                            <MenuItem value="RAW">RAW</MenuItem>
                                            <MenuItem value="FG">FG</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            label="Status"
                                            value={searchStatus}
                                            onChange={(e) => setSearchStatus(e.target.value)}
                                        >
                                            <MenuItem value="">All</MenuItem>
                                            <MenuItem value={1}>Active</MenuItem>
                                            <MenuItem value={0}>Inactive</MenuItem>
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
                                    <TableCell width={100}>Type</TableCell>
                                    <TableCell>SKU</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell width={100}>UOM</TableCell>
                                    <TableCell width={120}>Status</TableCell>
                                    <TableCell width={120}>Avg Cost</TableCell>
                                    <TableCell width={120}>Last Cost</TableCell>
                                    <TableCell width={150}>Std BOM Cost</TableCell>
                                    <TableCell align="right" width={150}>
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {products.data.length > 0 ? (
                                    products.data.map((row) => (
                                        <TableRow key={row.id} hover>
                                            <TableCell>{row.id}</TableCell>
                                            <TableCell>
                                                {row.factory ? `${row.factory.name} (${row.factory.code})` : "-"}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.type}
                                                    color={typeColor(row.type)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{row.sku}</TableCell>
                                            <TableCell>{row.name}</TableCell>
                                            <TableCell>{row.uom}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={activeLabel(row.is_active)}
                                                    color={activeColor(row.is_active)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{row.avg_cost}</TableCell>
                                            <TableCell>{row.last_cost}</TableCell>
                                            <TableCell>{row.standard_bom_cost}</TableCell>
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
                                        <TableCell colSpan={11} align="center">
                                            <Typography py={3} color="text.secondary">
                                                No products found.
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
                            Showing {products.from ?? 0} to {products.to ?? 0} of {products.total} entries
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
                <DialogTitle>Add Product</DialogTitle>
                <form onSubmit={submitCreate}>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth error={!!createForm.errors.factory_id}>
                                    <InputLabel>Factory</InputLabel>
                                    <Select
                                        label="Factory"
                                        value={createForm.data.factory_id}
                                        onChange={(e) => createForm.setData("factory_id", e.target.value)}
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
                                <FormControl fullWidth error={!!createForm.errors.type}>
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                        label="Type"
                                        value={createForm.data.type}
                                        onChange={(e) => createForm.setData("type", e.target.value)}
                                    >
                                        <MenuItem value="RAW">RAW</MenuItem>
                                        <MenuItem value="FG">FG</MenuItem>
                                    </Select>
                                    <FormHelperText>{createForm.errors.type}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="SKU"
                                    value={createForm.data.sku}
                                    onChange={(e) => createForm.setData("sku", e.target.value)}
                                    error={!!createForm.errors.sku}
                                    helperText={createForm.errors.sku}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Product Name"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData("name", e.target.value)}
                                    error={!!createForm.errors.name}
                                    helperText={createForm.errors.name}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="UOM"
                                    value={createForm.data.uom}
                                    onChange={(e) => createForm.setData("uom", e.target.value)}
                                    error={!!createForm.errors.uom}
                                    helperText={createForm.errors.uom}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Average Cost"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={createForm.data.avg_cost}
                                    onChange={(e) => createForm.setData("avg_cost", e.target.value)}
                                    error={!!createForm.errors.avg_cost}
                                    helperText={createForm.errors.avg_cost}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Last Cost"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={createForm.data.last_cost}
                                    onChange={(e) => createForm.setData("last_cost", e.target.value)}
                                    error={!!createForm.errors.last_cost}
                                    helperText={createForm.errors.last_cost}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Standard BOM Cost"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={createForm.data.standard_bom_cost}
                                    onChange={(e) => createForm.setData("standard_bom_cost", e.target.value)}
                                    error={!!createForm.errors.standard_bom_cost}
                                    helperText={createForm.errors.standard_bom_cost}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth error={!!createForm.errors.is_active}>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        label="Status"
                                        value={createForm.data.is_active}
                                        onChange={(e) =>
                                            createForm.setData("is_active", Number(e.target.value))
                                        }
                                    >
                                        <MenuItem value={1}>Active</MenuItem>
                                        <MenuItem value={0}>Inactive</MenuItem>
                                    </Select>
                                    <FormHelperText>{createForm.errors.is_active}</FormHelperText>
                                </FormControl>
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
                <DialogTitle>Edit Product</DialogTitle>
                <form onSubmit={submitEdit}>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth error={!!editForm.errors.factory_id}>
                                    <InputLabel>Factory</InputLabel>
                                    <Select
                                        label="Factory"
                                        value={editForm.data.factory_id}
                                        onChange={(e) => editForm.setData("factory_id", e.target.value)}
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
                                <FormControl fullWidth error={!!editForm.errors.type}>
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                        label="Type"
                                        value={editForm.data.type}
                                        onChange={(e) => editForm.setData("type", e.target.value)}
                                    >
                                        <MenuItem value="RAW">RAW</MenuItem>
                                        <MenuItem value="FG">FG</MenuItem>
                                    </Select>
                                    <FormHelperText>{editForm.errors.type}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="SKU"
                                    value={editForm.data.sku}
                                    onChange={(e) => editForm.setData("sku", e.target.value)}
                                    error={!!editForm.errors.sku}
                                    helperText={editForm.errors.sku}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Product Name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData("name", e.target.value)}
                                    error={!!editForm.errors.name}
                                    helperText={editForm.errors.name}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="UOM"
                                    value={editForm.data.uom}
                                    onChange={(e) => editForm.setData("uom", e.target.value)}
                                    error={!!editForm.errors.uom}
                                    helperText={editForm.errors.uom}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Average Cost"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={editForm.data.avg_cost}
                                    onChange={(e) => editForm.setData("avg_cost", e.target.value)}
                                    error={!!editForm.errors.avg_cost}
                                    helperText={editForm.errors.avg_cost}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Last Cost"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={editForm.data.last_cost}
                                    onChange={(e) => editForm.setData("last_cost", e.target.value)}
                                    error={!!editForm.errors.last_cost}
                                    helperText={editForm.errors.last_cost}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Standard BOM Cost"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={editForm.data.standard_bom_cost}
                                    onChange={(e) => editForm.setData("standard_bom_cost", e.target.value)}
                                    error={!!editForm.errors.standard_bom_cost}
                                    helperText={editForm.errors.standard_bom_cost}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth error={!!editForm.errors.is_active}>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        label="Status"
                                        value={editForm.data.is_active}
                                        onChange={(e) =>
                                            editForm.setData("is_active", Number(e.target.value))
                                        }
                                    >
                                        <MenuItem value={1}>Active</MenuItem>
                                        <MenuItem value={0}>Inactive</MenuItem>
                                    </Select>
                                    <FormHelperText>{editForm.errors.is_active}</FormHelperText>
                                </FormControl>
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
