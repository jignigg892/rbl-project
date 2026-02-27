import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography } from '@mui/material';
import { getApplications } from '../services/adminApi';

export default function DashboardPage() {
    const [apps, setApps] = useState([]);

    useEffect(() => {
        getApplications().then(setApps);
    }, []);

    return (
        <Paper sx={{ padding: 2 }}>
            <Typography variant="h5" gutterBottom>Dashboard</Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>App ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {apps.map((app) => (
                            <TableRow key={app.id}>
                                <TableCell>{app.id}</TableCell>
                                <TableCell>{app.name}</TableCell>
                                <TableCell>{app.status}</TableCell>
                                <TableCell>{app.date}</TableCell>
                                <TableCell>
                                    <Button variant="outlined" size="small">View Details</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}
