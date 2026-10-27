import { Box, Typography } from "@mui/material";

function PageHeader({ eyebrow, title, description, action }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
        mb: 3.5
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {eyebrow && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "#A64C6E"
              }}
            />
            <Typography
              sx={{
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                fontWeight: 700,
                color: "#6E2A4E"
              }}
            >
              {eyebrow}
            </Typography>
          </Box>
        )}

        <Typography
          component="h1"
          sx={{
            fontFamily: '"Fraunces", "Manrope", serif',
            fontSize: { xs: "2rem", md: "2.4rem" },
            fontWeight: 600,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            color: "#2B2530"
          }}
        >
          {title}
        </Typography>

        {description && (
          <Typography
            sx={{
              mt: 1,
              fontSize: "0.9rem",
              color: "#6E6672",
              lineHeight: 1.6,
              maxWidth: 650
            }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Box>
  );
}

export default PageHeader;