import { Box, Typography, CircularProgress } from "@mui/material";

export default function DeployCenterLoader() {
    return (
        <Box
            sx={{
                height: "100dvh",
                width: "100dvw",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                textAlign: "center",
            }}
        >
            {/* Logo Animation */}
            <Box
                sx={{
                    width: 90,
                    height: 90,
                    borderRadius: "50%",
                    border: "4px solid #2563EB",
                    borderTopColor: "transparent",
                    animation: "spin 1.2s linear infinite",
                }}
            />

            <Typography
                variant="h5"
                sx={{ fontWeight: "bold", color: "#2563EB", mt: 1 }}
            >
                Deploy Center
            </Typography>

            <Typography variant="body1" sx={{ color: "#9CA3AF" }}>
                Preparing your environment...
            </Typography>

            <CircularProgress sx={{ color: "#2563EB", mt: 2 }} />

            <style>
                {`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
        `}
            </style>
        </Box>
    );
}
