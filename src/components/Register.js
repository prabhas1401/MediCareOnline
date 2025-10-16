import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Typography, Box } from "@mui/material";

const Register = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Register as
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/register/patient")}
        >
          Patient
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/register/doctor")}
        >
          Doctor
        </Button>
      </Box>
    </Container>
  );
};

export default Register;