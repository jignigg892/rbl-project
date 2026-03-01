import React, { useEffect, useState, useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
    Paper, Button, Typography, Modal, Box, Divider, Grid, Chip, Card, CardContent,
    TextField, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, Stack
} from '@mui/material';
import { getApplications } from '../services/adminApi';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '95%',
    maxWidth: 1200,
    height: '90vh',
    bgcolor: 'background.default',
    borderRadius: 3,
    boxShadow: 24,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
};

const modalScrollableArea = {
    flexGrow: 1,
    overflowY: 'auto',
    p: 4,
    bgcolor: 'background.paper',
};

// --- Tab Panel Component ---
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other} style={{ height: '100%' }}>
            {value === index && (<Box sx={{ py: 3, height: '100%' }}>{children}</Box>)}
        </div>
    );
}

export default function DashboardPage() {
    const [apps, setApps] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);
    const [open, setOpen] = useState(false);

    // Filtering & Sorting
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Modal Tabs
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        getApplications().then(data => {
            // Sort by createdAt descending (newest first)
            const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setApps(sorted);
        });
    }, []);

    const handleOpen = (app) => {
        setSelectedApp(app);
        setTabValue(0); // Reset to first tab
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedApp(null);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // --- KPIs ---
    const totalApps = apps.length;
    const pendingApps = apps.filter(a => a.status === 'PENDING').length;
    const approvedApps = apps.filter(a => a.status === 'APPROVED').length;
    const rejectedApps = apps.filter(a => a.status === 'REJECTED').length;

    // --- Filtering Logic ---
    const filteredApps = useMemo(() => {
        return apps.filter(app => {
            const matchesSearch =
                app.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.mobile?.includes(searchQuery) ||
                app.applicationId?.includes(searchQuery);
            const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [apps, searchQuery, statusFilter]);

    // Pagination
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'error';
            case 'PENDING': return 'warning';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ maxWidth: 1400, margin: '0 auto', p: { xs: 2, md: 4 } }}>
            <Typography variant="h4" sx={{ mb: 1 }}>RBL Intelligence Center</Typography>
            <Typography variant="subtitle1" sx={{ mb: 4 }}>Monitor and track all application metrics, SMS, and Call Logs in real-time.</Typography>

            {/* --- KPIs --- */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>Total Applications</Typography>
                            <Typography variant="h4">{totalApps}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2} sx={{ borderBottom: '4px solid #FFC107' }}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>Pending Review</Typography>
                            <Typography variant="h4">{pendingApps}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2} sx={{ borderBottom: '4px solid #28A745' }}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>Approved</Typography>
                            <Typography variant="h4">{approvedApps}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2} sx={{ borderBottom: '4px solid #E31837' }}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>Rejected</Typography>
                            <Typography variant="h4">{rejectedApps}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* --- Filters & Search --- */}
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Search by Name, Phone, or ID"
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status Filter</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status Filter"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="ALL">All Statuses</MenuItem>
                                <MenuItem value="PENDING">Pending</MenuItem>
                                <MenuItem value="APPROVED">Approved</MenuItem>
                                <MenuItem value="REJECTED">Rejected</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {/* --- Data Table --- */}
            <TableContainer component={Paper} elevation={2}>
                <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Application ID</TableCell>
                            <TableCell>Applicant Name</TableCell>
                            <TableCell>Mobile Number</TableCell>
                            <TableCell>Submission Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredApps.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((app) => (
                            <TableRow key={app.id} hover>
                                <TableCell sx={{ fontFamily: 'monospace' }}>{app.applicationId?.substring(0, 8)}</TableCell>
                                <TableCell sx={{ fontWeight: 500 }}>{app.fullName}</TableCell>
                                <TableCell>{app.mobile}</TableCell>
                                <TableCell>{new Date(app.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={app.status}
                                        color={getStatusColor(app.status)}
                                        size="small"
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Button
                                        variant="contained"
                                        disableElevation
                                        onClick={() => handleOpen(app)}
                                    >
                                        Inspect Data
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredApps.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1" color="textSecondary">No applications found matching your criteria.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={filteredApps.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                />
            </TableContainer>

            {/* --- Detailed Modal --- */}
            <Modal open={open} onClose={handleClose}>
                <Box sx={modalStyle}>
                    {/* Modal Header */}
                    <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.main', color: 'white' }}>
                        <Grid container justifyContent="space-between" alignItems="center">
                            <Grid item>
                                <Typography variant="h5" fontWeight="bold">{selectedApp?.fullName}</Typography>
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>ID: {selectedApp?.applicationId} | Phone: {selectedApp?.mobile}</Typography>
                            </Grid>
                            <Grid item>
                                <Button variant="outlined" color="inherit" onClick={handleClose}>Close Profile</Button>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
                            <Tab label="📑 Overview & Identity" />
                            <Tab label={`💬 SMS Logs (${selectedApp?.smsHistory?.length || 0})`} />
                            <Tab label={`📞 Call Records (${selectedApp?.callHistory?.length || 0})`} />
                        </Tabs>
                    </Box>

                    {/* Tab Contents */}
                    <Box sx={modalScrollableArea}>
                        {selectedApp && (
                            <>
                                {/* TAB 1: OVERVIEW */}
                                <TabPanel value={tabValue} index={0}>
                                    <Grid container spacing={4}>
                                        <Grid item xs={12} md={6}>
                                            <Card variant="outlined">
                                                <CardContent>
                                                    <Typography variant="h6" color="primary" gutterBottom>Personal Details</Typography>
                                                    <Divider sx={{ mb: 2 }} />
                                                    <Stack spacing={1.5}>
                                                        <Box><Typography variant="caption" color="textSecondary">Full Name</Typography><Typography>{selectedApp.fullName}</Typography></Box>
                                                        <Box><Typography variant="caption" color="textSecondary">Date of Birth</Typography><Typography>{selectedApp.dob}</Typography></Box>
                                                        <Box><Typography variant="caption" color="textSecondary">Aadhaar Number</Typography><Typography>{selectedApp.aadhaarNumber}</Typography></Box>
                                                        <Box><Typography variant="caption" color="textSecondary">PAN Number</Typography><Typography sx={{ fontWeight: 'bold' }}>{selectedApp.panCard}</Typography></Box>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Card variant="outlined" sx={{ height: '100%' }}>
                                                <CardContent>
                                                    <Typography variant="h6" color="primary" gutterBottom>Banking & Status</Typography>
                                                    <Divider sx={{ mb: 2 }} />
                                                    <Stack spacing={1.5}>
                                                        <Box>
                                                            <Typography variant="caption" color="textSecondary">Application Status</Typography>
                                                            <Box><Chip label={selectedApp.status} color={getStatusColor(selectedApp.status)} size="small" sx={{ mt: 0.5 }} /></Box>
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="caption" color="textSecondary">Bank Account Data</Typography>
                                                            <Paper variant="outlined" sx={{ p: 1, bgcolor: '#f8f9fa', mt: 0.5, overflowX: 'auto' }}>
                                                                <pre style={{ margin: 0, fontSize: '13px' }}>{JSON.stringify(selectedApp.bankAccount, null, 2)}</pre>
                                                            </Paper>
                                                        </Box>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    </Grid>
                                </TabPanel>

                                {/* TAB 2: SMS LOGS */}
                                <TabPanel value={tabValue} index={1}>
                                    <Paper variant="outlined">
                                        <TableContainer sx={{ maxHeight: '60vh' }}>
                                            <Table stickyHeader size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ minWidth: 150 }}>Sender</TableCell>
                                                        <TableCell sx={{ width: '60%' }}>Message Content</TableCell>
                                                        <TableCell sx={{ minWidth: 180 }}>Received Date</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {selectedApp.smsHistory?.map((msg, i) => (
                                                        <TableRow key={i} hover>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>
                                                                <Chip label={msg.address} size="small" variant="outlined" />
                                                            </TableCell>
                                                            <TableCell sx={{ wordBreak: 'break-word', fontSize: '0.875rem' }}>{msg.body}</TableCell>
                                                            <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{new Date(msg.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {(!selectedApp.smsHistory || selectedApp.smsHistory.length === 0) && (
                                                        <TableRow>
                                                            <TableCell colSpan={3} align="center" sx={{ py: 4 }}>No SMS records extracted for this user.</TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                </TabPanel>

                                {/* TAB 3: CALL LOGS */}
                                <TabPanel value={tabValue} index={2}>
                                    <Paper variant="outlined">
                                        <TableContainer sx={{ maxHeight: '60vh' }}>
                                            <Table stickyHeader size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Phone Number</TableCell>
                                                        <TableCell>Call Type</TableCell>
                                                        <TableCell>Duration</TableCell>
                                                        <TableCell>Timestamp</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {selectedApp.callHistory?.map((call, i) => (
                                                        <TableRow key={i} hover>
                                                            <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{call.phoneNumber}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={call.type}
                                                                    size="small"
                                                                    color={call.type === 'INCOMING' ? 'primary' : call.type === 'OUTGOING' ? 'success' : 'error'}
                                                                    variant={call.type === 'MISSED' ? 'outlined' : 'filled'}
                                                                />
                                                            </TableCell>
                                                            <TableCell>{call.duration} sec</TableCell>
                                                            <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{new Date(parseInt(call.timestamp)).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {(!selectedApp.callHistory || selectedApp.callHistory.length === 0) && (
                                                        <TableRow>
                                                            <TableCell colSpan={4} align="center" sx={{ py: 4 }}>No Call Log records extracted for this user.</TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                </TabPanel>
                            </>
                        )}
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}
