import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Checkbox,
    FormControlLabel,
    Tabs,
    Tab,
} from '@mui/material';
import { notificationsAPI } from '../../services/api';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export default function AdminNotifications() {
    const [tabValue, setTabValue] = useState(0);
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [message, setMessage] = useState(null);
    const [qrRefreshCount, setQrRefreshCount] = useState(0);

    // Auto-refresh QR every 60 seconds
    useEffect(() => {
        if (qrCode && !loggedIn) {
            const timer = setTimeout(() => {
                handleRefreshQR();
            }, 60000); // 60 seconds

            return () => clearTimeout(timer);
        }
    }, [qrCode, loggedIn, qrRefreshCount]);

    const handleRefreshQR = async () => {
        try {
            const response = await notificationsAPI.initWhatsApp();
            if (response.status === 'qr_ready') {
                setQrCode(response.qr);
                setQrRefreshCount(prev => prev + 1);
                setMessage({ type: 'info', text: '🔄 QR actualizado' });
            }
        } catch (error) {
            console.error('Error refreshing QR:', error);
        }
    };

    const handleInitWhatsApp = async () => {
        setLoading(true);
        setMessage(null);
        setQrRefreshCount(0);
        try {
            const response = await notificationsAPI.initWhatsApp();

            if (response.status === 'already_logged_in') {
                setLoggedIn(true);
                setMessage({ type: 'success', text: '✓ Ya estás logueado en WhatsApp' });
            } else if (response.status === 'qr_ready') {
                setQrCode(response.qr);
                setMessage({ type: 'info', text: '📱 Escanea el QR con tu teléfono' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: `Error: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyLogin = async () => {
        setLoading(true);
        try {
            const response = await notificationsAPI.verifyWhatsApp();

            if (response.logged_in) {
                setLoggedIn(true);
                setQrCode(null);
                setMessage({ type: 'success', text: '✓ Login verificado exitosamente' });
            } else {
                setMessage({ type: 'error', text: '✗ Aún no has escaneado el QR' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: `Error: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleSendTest = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const response = await notificationsAPI.testWhatsApp('969728039');

            if (response.status === 'success') {
                setMessage({ type: 'success', text: `✓ Mensaje enviado a ${response.phone}` });
            } else {
                setMessage({ type: 'error', text: `✗ Error: ${response.message}` });
            }
        } catch (error) {
            setMessage({ type: 'error', text: `Error: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSession = async () => {
        setLoading(true);
        try {
            await notificationsAPI.closeWhatsApp();
            setQrCode(null);
            setLoggedIn(false);
            setScanned(false);
            setQrRefreshCount(0);
            setMessage({ type: 'info', text: 'Sesión cerrada' });
        } catch (error) {
            setMessage({ type: 'error', text: `Error: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                📱 Notificaciones WhatsApp
            </Typography>

            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                <Tab label="WhatsApp Login" />
                <Tab label="Faltas" disabled />
                <Tab label="Deudas" disabled />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Iniciar Sesión WhatsApp
                        </Typography>

                        {/* Advertencia */}
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            <strong>⚠️ IMPORTANTE:</strong>
                            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                                <li>Cierra WhatsApp Web en otros dispositivos</li>
                                <li>Escanea el QR con tu teléfono</li>
                                <li>El QR se actualiza cada 60 segundos</li>
                                <li>No cierres esta ventana hasta terminar el envío</li>
                            </ul>
                        </Alert>

                        {/* Mensajes */}
                        {message && (
                            <Alert severity={message.type} sx={{ mb: 2 }}>
                                {message.text}
                            </Alert>
                        )}

                        {/* QR Code */}
                        {qrCode && (
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <img
                                    src={`data:image/png;base64,${qrCode}`}
                                    alt="QR Code"
                                    style={{
                                        width: '400px',
                                        height: '400px',
                                        border: '2px solid #ccc',
                                        borderRadius: '8px',
                                        objectFit: 'contain'
                                    }}
                                />
                                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                    Actualización automática en 60s
                                </Typography>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={scanned}
                                            onChange={(e) => setScanned(e.target.checked)}
                                        />
                                    }
                                    label="Ya escaneé el QR"
                                    sx={{ mt: 2, display: 'block' }}
                                />
                            </Box>
                        )}

                        {/* Botones */}
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {!qrCode && !loggedIn && (
                                <Button
                                    variant="contained"
                                    onClick={handleInitWhatsApp}
                                    disabled={loading}
                                    startIcon={loading && <CircularProgress size={20} />}
                                >
                                    Iniciar WhatsApp
                                </Button>
                            )}

                            {qrCode && scanned && (
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleVerifyLogin}
                                    disabled={loading}
                                >
                                    Verificar Login
                                </Button>
                            )}

                            {loggedIn && (
                                <>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSendTest}
                                        disabled={loading}
                                    >
                                        Enviar Mensaje de Prueba
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={handleCloseSession}
                                        disabled={loading}
                                    >
                                        Cerrar Sesión
                                    </Button>
                                </>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <Typography>Notificaciones de Faltas (Próximamente)</Typography>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                <Typography>Notificaciones de Deudas (Próximamente)</Typography>
            </TabPanel>
        </Box>
    );
}
