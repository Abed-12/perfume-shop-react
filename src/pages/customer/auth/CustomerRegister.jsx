import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useCustomerRegisterMutation } from "../../../redux/api/customerApi";
import { selectIsAuthenticated } from "../../../redux/slices/authSlice";
import { handleSuccess, handleError } from "../../../utils/toastHelper";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Avatar from "@mui/material/Avatar";
import Link from "@mui/material/Link";
import Fade from "@mui/material/Fade";
import Slide from "@mui/material/Slide";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HomeIcon from "@mui/icons-material/Home";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { ToastContainer } from "react-toastify";

const GOVERNORATES = [
    "AMMAN",
    "ZARQA",
    "IRBID",
    "AQABA",
    "MAFRAQ",
    "KARAK",
    "MADABA",
    "AJLOUN",
    "JERASH",
    "BALQA",
    "TAFILAH",
    "MAAN",
];

const JO_PHONE_REGEX = /^(\+962)?7[789]\d{7}$/;

const isValidPassword = (pw) =>
    pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw);

// Styles
const fieldSx = () => ({
    "& .MuiOutlinedInput-root": {
        borderRadius: 2,
        backgroundColor: "rgba(255,255,255,0.05)",
        "& input, & textarea": { color: "#FFFFFF" },
        "& fieldset": {
            borderColor: "rgba(212,175,55,0.3)",
        },
        "&:hover fieldset": {
            borderColor: "#D4AF37",
        },
        "&.Mui-focused fieldset": {
            borderColor: "#D4AF37",
        },
    },
    "& .MuiFormHelperText-root": {
        color: "#f44336",
        marginLeft: 0,
    },
    "& .MuiInputLabel-root": {
        color: "rgba(255,255,255,0.5)",
    },
});

const selectSx = {
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#FFFFFF",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(212,175,55,0.3)" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#D4AF37" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#D4AF37" },
    "& .MuiSvgIcon-root": { color: "#D4AF37" },
};

const menuProps = {
    PaperProps: {
        sx: {
            background: "#1a1a1a",
            border: "1px solid rgba(212,175,55,0.3)",
            "& .MuiMenuItem-root": {
                color: "#FFF",
                "&:hover": { backgroundColor: "rgba(212,175,55,0.15)" },
                "&.Mui-selected": {
                    backgroundColor: "rgba(212,175,55,0.25)",
                    color: "#D4AF37",
                },
            },
        },
    },
};

// Component
const CustomerRegister = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";

    const [register, { isLoading }] = useCustomerRegisterMutation();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        alternativePhoneNumber: "",
        governorate: "AMMAN",
        address: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    if (isAuthenticated) {
        return <Navigate to="#" replace />;
    }
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Format phone for display: +962797298546 → 7 9729 8546
    const formatPhoneDisplay = (fullPhone) => {
        if (!fullPhone) return "";

        let digits = fullPhone.replace(/\D/g, "");

        if (digits.startsWith("962")) {
            digits = digits.slice(3);
        }

        if (digits.startsWith("7") && digits.length === 9) {
            return digits.replace(/(\d)(\d{4})(\d{4})/, "$1 $2 $3");
        }

        return digits;
    };

    // Handle phone input and store as +962XXXXXXXXX
    const handlePhoneInput = (fieldName, inputValue) => {
        let digits = inputValue.replace(/\D/g, "");

        if (digits.startsWith("962")) {
            digits = digits.slice(3);
        }

        if (digits.startsWith("0")) {
            digits = digits.slice(1);
        }

        digits = digits.slice(0, 9);

        const fullNumber = digits ? "+962" + digits : "";

        handleChange({
            target: {
                name: fieldName,
                value: fullNumber
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = [];

        if (!isValidPassword(formData.password)) {
            errors.push(t("auth.register.passwordRequirements"));
        }
        if (formData.password !== formData.confirmPassword) {
            errors.push(t("auth.register.passwordsMismatch"));
        }
        if (!JO_PHONE_REGEX.test(formData.phoneNumber)) {
            errors.push(t("auth.register.invalidPhone"));
        }
        if (
            formData.alternativePhoneNumber &&
            formData.alternativePhoneNumber.trim() &&
            !JO_PHONE_REGEX.test(formData.alternativePhoneNumber)
        ) {
            errors.push(t("auth.register.invalidAlternativePhone"));
        }
        if (
            formData.alternativePhoneNumber &&
            formData.alternativePhoneNumber.trim() &&
            formData.alternativePhoneNumber === formData.phoneNumber
        ) {
            errors.push(t("auth.register.phoneNumbersSame"));
        }

        if (errors.length > 0) {
            const allErrors = errors.map((error, index) => `${index + 1}. ${error}`).join("\n");
            handleError(allErrors);
            return;
        }

        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            governorate: formData.governorate,
            address: formData.address,
            password: formData.password
        };

        if (formData.alternativePhoneNumber && formData.alternativePhoneNumber.trim()) {
            payload.alternativePhoneNumber = formData.alternativePhoneNumber;
        }

        try {
            const result = await register(payload).unwrap();
            handleSuccess(result.message);
            setTimeout(() => navigate("/login", { replace: true }), 1500);
        } catch (error) {
            if (error?.data?.data) {
                const messages = Object.values(error.data.data).map((error, index) => `${index + 1}. ${error}`).join("\n");
                handleError(messages);
            } else {
                handleError(error?.data?.message);
            }
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background:
                    "linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 50%, #EFEFEF 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                py: 4,
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)',
                }
            }}
        >

            <Container maxWidth="md">
                <Fade in timeout={1000}>
                    <Slide direction="up" in timeout={800}>
                        <Paper
                            sx={{
                                p: { xs: 3, sm: 4 },
                                borderRadius: 4,
                                border: "2px solid #D4AF37",
                                boxShadow: "0 8px 32px rgba(212,175,55,0.3)",
                                background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
                            }}
                        >
                            {/* Header */}
                            <Box sx={{ textAlign: "center", mb: 4 }}>
                                <Slide direction="down" in timeout={1000}>
                                    <Avatar
                                        sx={{
                                            width: 72,
                                            height: 72,
                                            margin: "0 auto 16px",
                                            background:
                                                "linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)",
                                            boxShadow: "0 8px 24px rgba(212,175,55,0.4)",
                                        }}
                                    />
                                </Slide>
                                <Typography
                                    variant="h4"
                                    sx={{ fontWeight: 700, color: "#D4AF37", mb: 0.5 }}
                                >
                                    {t("auth.register.title")}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: "rgba(255,255,255,0.6)" }}
                                >
                                    {t("auth.register.subtitle")}
                                </Typography>
                            </Box>

                            <Box component="form" onSubmit={handleSubmit}>
                                {/* Row 1 — First + Last Name */}
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }} mb={0}>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: '#FFFFFF',
                                                m: 1,
                                                fontWeight: 600,
                                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                            }}
                                        >
                                            {t('auth.register.firstNamePlaceholder')}
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            required
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            sx={fieldSx()}
                                            size="small"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon
                                                            sx={{ color: "#D4AF37", fontSize: 20, mr: isRTL ? 2 : 0 }}
                                                        />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }} mb={0}>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: '#FFFFFF',
                                                m: 1,
                                                fontWeight: 600,
                                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                            }}
                                        >
                                            {t('auth.register.lastNamePlaceholder')}
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            required
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            sx={fieldSx()}
                                            size="small"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon
                                                            sx={{ color: "#D4AF37", fontSize: 20, mr: isRTL ? 2 : 0 }}
                                                        />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Row 2 — Email + Governorate */}
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }} mb={0}>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: '#FFFFFF',
                                                m: 1,
                                                fontWeight: 600,
                                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                            }}
                                        >
                                            {t('auth.register.emailPlaceholder')}
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            required
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            sx={fieldSx()}
                                            size="small"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <EmailIcon
                                                            sx={{
                                                                color: "#D4AF37",
                                                                fontSize: 20,
                                                                mr: isRTL ? 2 : 0,
                                                            }}
                                                        />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }} mb={0}>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: '#FFFFFF',
                                                m: 1,
                                                fontWeight: 600,
                                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                            }}
                                        >
                                            {t('auth.register.governoratePlaceholder')}
                                        </Typography>
                                        <FormControl fullWidth>
                                            <Select
                                                name="governorate"
                                                value={formData.governorate}
                                                onChange={handleChange}
                                                displayEmpty
                                                sx={selectSx}
                                                size="small"
                                                MenuProps={menuProps}
                                                startAdornment={
                                                    <InputAdornment position="start">
                                                        <LocationOnIcon
                                                            sx={{ color: "#D4AF37", mr: isRTL ? 2 : 0, fontSize: 20 }}
                                                        />
                                                    </InputAdornment>
                                                }
                                            >
                                                {GOVERNORATES.map((gov) => (
                                                    <MenuItem key={gov} value={gov}>
                                                        {t(`governorates.${gov}`, { defaultValue: gov })}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                {/* Row 3 — Phone + Alt Phone */}
                                <Grid container spacing={2}>
                                    {[
                                        {
                                            fieldName: "phoneNumber",
                                            label: t("auth.register.phoneNumber"),
                                            required: true,
                                        },
                                        {
                                            fieldName: "alternativePhoneNumber",
                                            label: t("auth.register.alternativePhoneNumber"),
                                            required: false,
                                        },
                                    ].map(({ fieldName, label, required }) => (
                                        <Grid size={{ xs: 12, sm: 6 }} mb={0} key={fieldName}>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    color: '#FFFFFF',
                                                    m: 1,
                                                    fontWeight: 600,
                                                    fontSize: { xs: '0.9rem', sm: '1rem' },
                                                    textAlign: "start",
                                                }}
                                            >
                                                {label}
                                            </Typography>
                                            <Box sx={{ display: "flex", gap: 1, direction: "ltr" }}>
                                                {/* Fixed +962 badge */}
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 0.5,
                                                        p: 1,
                                                        height: "40px",
                                                        borderRadius: 2,
                                                        border: "1px solid rgba(212,175,55,0.3)",
                                                        backgroundColor: "rgba(255,255,255,0.05)"
                                                    }}
                                                >
                                                    <Typography sx={{ fontSize: "1rem", color: "#D4AF37" }}>
                                                        🇯🇴
                                                    </Typography>
                                                    <Typography
                                                        sx={{
                                                            color: "#D4AF37",
                                                            fontWeight: 700,
                                                            fontSize: "0.9rem",
                                                        }}
                                                    >
                                                        +962
                                                    </Typography>
                                                </Box>

                                                <TextField
                                                    fullWidth
                                                    required={required}
                                                    value={formatPhoneDisplay(formData[fieldName])}
                                                    onChange={(e) =>
                                                        handlePhoneInput(fieldName, e.target.value)
                                                    }
                                                    placeholder="7 XXXX XXXX"
                                                    inputProps={{ inputMode: "numeric" }}
                                                    sx={fieldSx()}
                                                    size="small"
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <PhoneAndroidIcon
                                                                    sx={{ color: "#D4AF37", fontSize: 20 }}
                                                                />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Row 4 — Password + Confirm */}
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }} mb={0}>
                                        <Typography
                                                variant="body1"
                                                sx={{
                                                    color: '#FFFFFF',
                                                    m: 1,
                                                    fontWeight: 600,
                                                    fontSize: { xs: '0.9rem', sm: '1rem' },
                                                }}
                                            >
                                                {t('auth.register.passwordPlaceholder')}
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            required
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            sx={fieldSx()}
                                            size="small"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockIcon
                                                            sx={{
                                                                color: "#D4AF37",
                                                                fontSize: 20,
                                                                ml: isRTL ? 2 : 0,
                                                            }}
                                                        />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPassword((p) => !p)}
                                                            sx={{ color: "#D4AF37" }}
                                                        >
                                                            {showPassword ? (
                                                                <VisibilityOff fontSize="small" />
                                                            ) : (
                                                                <Visibility fontSize="small" />
                                                            )}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: '#FFFFFF',
                                                m: 1,
                                                fontWeight: 600,
                                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                            }}
                                        >
                                            {t('auth.register.confirmPasswordPlaceholder')}
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            required
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            sx={fieldSx()}
                                            size="small"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockIcon sx={{ color: "#D4AF37", fontSize: 20, ml: isRTL ? 2 : 0 }} />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowConfirmPassword((p) => !p)}
                                                            sx={{ color: "#D4AF37" }}
                                                        >
                                                            {showConfirmPassword ? (
                                                                <VisibilityOff fontSize="small" />
                                                            ) : (
                                                                <Visibility fontSize="small" />
                                                            )}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Row 5 — Address */}
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: '#FFFFFF',
                                        m: 1,
                                        fontWeight: 600,
                                        fontSize: { xs: '0.9rem', sm: '1rem' },
                                    }}
                                >
                                    {t('auth.register.addressPlaceholder')}
                                </Typography>
                                <TextField
                                    fullWidth
                                    required
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    multiline
                                    size="small"
                                    rows={2}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                            backgroundColor: "rgba(255,255,255,0.05)",
                                            "& textarea": { color: "#FFFFFF" },
                                            "& fieldset": { borderColor: "rgba(212,175,55,0.3)" },
                                            "&:hover fieldset": { borderColor: "#D4AF37" },
                                            "&.Mui-focused fieldset": { borderColor: "#D4AF37" },
                                        },
                                        "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" },
                                        "& .MuiInputLabel-root.Mui-focused": { color: "#D4AF37" },
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment
                                                position="start"
                                                sx={{ alignSelf: 'flex-start', mt: 1, ml: isRTL ? 1 : 0 }}
                                            >
                                                <HomeIcon sx={{ color: "#D4AF37", fontSize: 20 }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {/* Submit */}
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={isLoading}
                                    sx={{
                                        mt: 1,
                                        py: 1.5,
                                        borderRadius: 2,
                                        fontSize: "1rem",
                                        fontWeight: 600,
                                        textTransform: "none",
                                        background:
                                            "linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)",
                                        color: "#000",
                                        boxShadow: "0 4px 15px rgba(212,175,55,0.4)",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            background:
                                                "linear-gradient(135deg, #F4D03F 0%, #D4AF37 100%)",
                                            boxShadow: "0 6px 20px rgba(212,175,55,0.5)",
                                            transform: "translateY(-2px)",
                                        },
                                        "&:active": { transform: "translateY(0)" },
                                        "&.Mui-disabled": {
                                            background: "rgba(212,175,55,0.3)",
                                            color: "rgba(0,0,0,0.5)",
                                        },
                                    }}
                                >
                                    {isLoading ? (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <CircularProgress size={20} sx={{ color: "#000" }} />
                                            <span>{t("auth.register.registering")}</span>
                                        </Box>
                                    ) : (
                                        t("auth.register.registerButton")
                                    )}
                                </Button>

                                {/* Login link */}
                                <Box sx={{ textAlign: "center", mt: 2.5 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: "rgba(255,255,255,0.5)", display: "inline" }}
                                    >
                                        {t("auth.register.alreadyHaveAccount")}{" "}
                                    </Typography>
                                    <Link
                                        href="/login"
                                        underline="hover"
                                        sx={{
                                            color: "#D4AF37",
                                            fontWeight: 600,
                                            "&:hover": { color: "#B8941E" },
                                        }}
                                    >
                                        {t("auth.register.loginButton")}
                                    </Link>
                                </Box>
                            </Box>
                        </Paper>
                    </Slide>
                </Fade>
            </Container>

            <ToastContainer />
        </Box>
    );
};

export default CustomerRegister;
