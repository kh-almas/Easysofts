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
    Divider,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Switch,
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

type FactoryRow = {
    id: number;
    name: string;
    code: string;
    address?: string | null;
    status: number;
    created_at?: string;
    updated_at?: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type FactoriesPageProps = {
    factories: {
        data: FactoryRow[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
        links: PaginationLink[];
    };
    filters: {
        q?: string;
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
        title: "Factories",
        href: "/factories",
    },
];

const defaultFormData = {
    name: "",
    code: "",
    address: "",
    status: 1,
};

export default function Index({ factories, filters }: FactoriesPageProps) {
    const { flash } = usePage<PageProps>().props;

    const [search, setSearch] = useState(filters?.q || "");
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editingRow, setEditingRow] = useState<FactoryRow | null>(null);

    const createForm = useForm({
        name: "",
        code: "",
        address: "",
        status: 1,
    });

    const editForm = useForm({
        name: "",
        code: "",
        address: "",
        status: 1,
    });

    const statusLabel = (status: number) => (status === 1 ? "Active" : "Inactive");

    const statusColor = (status: number): "success" | "default" => {
        return status === 1 ? "success" : "default";
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

    const openEditModal = (row: FactoryRow) => {
        setEditingRow(row);
        editForm.setData({
            name: row.name || "",
            code: row.code || "",
            address: row.address || "",
            status: Number(row.status) === 1 ? 1 : 0,
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
            "/factories",
            { q: search },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const resetSearch = () => {
        setSearch("");
        router.get(
            "/factories",
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const submitCreate = (e: FormEvent) => {
        e.preventDefault();

        createForm.post("/factories", {
            preserveScroll: true,
            onSuccess: () => {
                closeCreateModal();
            },
        });
    };

    const submitEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!editingRow) return;

        editForm.put(`/factories/${editingRow.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                closeEditModal();
            },
        });
    };

    const handleDelete = (row: FactoryRow) => {
        if (!confirm(`Are you sure you want to delete "${row.name}"?`)) return;

        router.delete(`/factories/${row.id}`, {
            preserveScroll: true,
        });
    };

    const paginationLinks = useMemo(() => {
        return factories?.links || [];
    }, [factories]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Factories" />

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
                                Factory Management
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Create, update, search and delete factories
                            </Typography>
                        </Box>

                        <Button variant="contained" onClick={openCreateModal}>
                            Add Factory
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
                                <Grid size={{ xs: 12, md: 8 }}>
                                    <TextField
                                        fullWidth
                                        label="Search by name or code"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
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
                                    <TableCell width={80}>ID</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Code</TableCell>
                                    <TableCell>Address</TableCell>
                                    <TableCell width={130}>Status</TableCell>
                                    <TableCell align="right" width={160}>
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {factories.data.length > 0 ? (
                                    factories.data.map((row) => (
                                        <TableRow key={row.id} hover>
                                            <TableCell>{row.id}</TableCell>
                                            <TableCell>{row.name}</TableCell>
                                            <TableCell>{row.code}</TableCell>
                                            <TableCell>{row.address || "-"}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={statusLabel(row.status)}
                                                    color={statusColor(row.status)}
                                                    size="small"
                                                />
                                            </TableCell>
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
                                        <TableCell colSpan={6} align="center">
                                            <Typography py={3} color="text.secondary">
                                                No factories found.
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
                            Showing {factories.from ?? 0} to {factories.to ?? 0} of {factories.total} entries
                        </Typography>

                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {paginationLinks.map((link, index) => {
                                const label = link.label
                                    .replace("&laquo; Previous", "Previous")
                                    .replace("Next &raquo;", "Next");

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

            <Dialog open={openCreate} onClose={closeCreateModal} fullWidth maxWidth="sm">
                <DialogTitle>Add Factory</DialogTitle>
                <form onSubmit={submitCreate}>
                    <DialogContent dividers>
                        <Stack spacing={2}>
                            <TextField
                                label="Factory Name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData("name", e.target.value)}
                                error={!!createForm.errors.name}
                                helperText={createForm.errors.name}
                                fullWidth
                            />

                            <TextField
                                label="Factory Code"
                                value={createForm.data.code}
                                onChange={(e) => createForm.setData("code", e.target.value)}
                                error={!!createForm.errors.code}
                                helperText={createForm.errors.code}
                                fullWidth
                            />

                            <TextField
                                label="Address"
                                value={createForm.data.address}
                                onChange={(e) => createForm.setData("address", e.target.value)}
                                error={!!createForm.errors.address}
                                helperText={createForm.errors.address}
                                fullWidth
                                multiline
                                minRows={3}
                            />

                            <FormControl fullWidth error={!!createForm.errors.status}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    label="Status"
                                    value={createForm.data.status}
                                    onChange={(e) =>
                                        createForm.setData("status", Number(e.target.value))
                                    }
                                >
                                    <MenuItem value={1}>Active</MenuItem>
                                    <MenuItem value={0}>Inactive</MenuItem>
                                </Select>
                                <FormHelperText>{createForm.errors.status}</FormHelperText>
                            </FormControl>
                        </Stack>
                    </DialogContent>

                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={closeCreateModal}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={createForm.processing}>
                            {createForm.processing ? "Saving..." : "Save"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={openEdit} onClose={closeEditModal} fullWidth maxWidth="sm">
                <DialogTitle>Edit Factory</DialogTitle>
                <form onSubmit={submitEdit}>
                    <DialogContent dividers>
                        <Stack spacing={2}>
                            <TextField
                                label="Factory Name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData("name", e.target.value)}
                                error={!!editForm.errors.name}
                                helperText={editForm.errors.name}
                                fullWidth
                            />

                            <TextField
                                label="Factory Code"
                                value={editForm.data.code}
                                onChange={(e) => editForm.setData("code", e.target.value)}
                                error={!!editForm.errors.code}
                                helperText={editForm.errors.code}
                                fullWidth
                            />

                            <TextField
                                label="Address"
                                value={editForm.data.address}
                                onChange={(e) => editForm.setData("address", e.target.value)}
                                error={!!editForm.errors.address}
                                helperText={editForm.errors.address}
                                fullWidth
                                multiline
                                minRows={3}
                            />

                            <FormControl fullWidth error={!!editForm.errors.status}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    label="Status"
                                    value={editForm.data.status}
                                    onChange={(e) =>
                                        editForm.setData("status", Number(e.target.value))
                                    }
                                >
                                    <MenuItem value={1}>Active</MenuItem>
                                    <MenuItem value={0}>Inactive</MenuItem>
                                </Select>
                                <FormHelperText>{editForm.errors.status}</FormHelperText>
                            </FormControl>
                        </Stack>
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
