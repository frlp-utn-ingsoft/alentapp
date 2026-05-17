import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Stack, Input, Text, Box } from "@chakra-ui/react";
import { Field } from "../ui/field";

export interface MedicalCertificateFormData {
  member_dni: string;
  issue_date: string;
  expiry_date: string;
  doctor_license: string;
  institution: string;
}

export interface MedicalCertificateFormRef {
  validateAndGetData: () => MedicalCertificateFormData | null;
  reset: () => void;
}

function validateDni(value: string) {
  if (!value) return "El DNI es obligatorio";
  if (!/^\d+$/.test(value)) return "El DNI debe contener solo números";
  if (value.length < 7 || value.length > 8) return "El DNI debe tener entre 7 y 8 dígitos";
  return "";
}

function validateDoctorLicense(value: string) {
  if (!value) return "La matrícula es obligatoria";
  if (!/^[a-zA-Z0-9]+$/.test(value)) return "La matrícula solo permite letras y números";
  if (value.length > 10) return "La matrícula no puede exceder los 10 caracteres";
  return "";
}

function validateInstitution(value: string) {
  if (!value) return "La institución es obligatoria";
  if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.\,]+$/.test(value)) return "La institución contiene caracteres no permitidos";
  if (value.length > 60) return "La institución no puede exceder los 60 caracteres";
  return "";
}

function validateDate(value: string) {
  if (!value) return "La fecha es obligatoria";
  const date = new Date(value + "T00:00:00");
  if (isNaN(date.getTime())) return "La fecha ingresada no es válida";
  return "";
}

export const MedicalCertificateForm = forwardRef<MedicalCertificateFormRef, object>(function MedicalCertificateForm(_props, ref) {
  const [memberDni, setMemberDni] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [doctorLicense, setDoctorLicense] = useState("");
  const [institution, setInstitution] = useState("");

  const [errors, setErrors] = useState({
    memberDni: "",
    issueDate: "",
    expiryDate: "",
    doctorLicense: "",
    institution: "",
    dates: "",
    form: "",
  });

  useImperativeHandle(ref, () => ({
    validateAndGetData: () => {
      const newErrors = {
        memberDni: validateDni(memberDni),
        issueDate: validateDate(issueDate),
        expiryDate: validateDate(expiryDate),
        doctorLicense: validateDoctorLicense(doctorLicense),
        institution: validateInstitution(institution),
        dates: "",
        form: "",
      };

      if (issueDate && expiryDate && !newErrors.issueDate && !newErrors.expiryDate) {
        if (new Date(expiryDate + "T00:00:00") <= new Date(issueDate + "T00:00:00")) {
          newErrors.dates = "La fecha de vencimiento debe ser posterior a la de emisión";
        }
      }

      const hasErrors = Object.values(newErrors).some((err) => err !== "");
      if (hasErrors) {
        newErrors.form = "Por favor, corrija los errores antes de continuar";
        setErrors(newErrors);
        return null;
      }

      setErrors({ memberDni: "", issueDate: "", expiryDate: "", doctorLicense: "", institution: "", dates: "", form: "" });
      return { member_dni: memberDni, issue_date: issueDate, expiry_date: expiryDate, doctor_license: doctorLicense, institution };
    },
    reset: () => {
      setMemberDni("");
      setIssueDate("");
      setExpiryDate("");
      setDoctorLicense("");
      setInstitution("");
      setErrors({ memberDni: "", issueDate: "", expiryDate: "", doctorLicense: "", institution: "", dates: "", form: "" });
    },
  }), [memberDni, issueDate, expiryDate, doctorLicense, institution]);

  useEffect(() => {
    if (issueDate && expiryDate) {
      const issueValid = !validateDate(issueDate);
      const expiryValid = !validateDate(expiryDate);
      if (issueValid && expiryValid && new Date(expiryDate + "T00:00:00") <= new Date(issueDate + "T00:00:00")) {
        setErrors((prev) => ({ ...prev, dates: "La fecha de vencimiento debe ser posterior a la de emisión" }));
      } else {
        setErrors((prev) => ({ ...prev, dates: "" }));
      }
    } else {
      setErrors((prev) => ({ ...prev, dates: "" }));
    }
  }, [issueDate, expiryDate]);

  const clearFieldError = (field: keyof typeof errors) => {
    setErrors((prev) => ({ ...prev, [field]: "", form: "" }));
  };

  return (
    <Stack gap="4">
      <Box>
        <Field label="DNI del Socio" required invalid={!!errors.memberDni}>
          <Input
            placeholder="Ej. 12345678"
            maxLength={8}
            value={memberDni}
            onChange={(e) => {
              setMemberDni(e.target.value);
              setErrors((prev) => ({ ...prev, memberDni: validateDni(e.target.value), form: "" }));
            }}
          />
        </Field>
        <FieldError text={errors.memberDni} />
        {!errors.memberDni && (
          <Text fontSize="xs" color="fg.muted" mt="1">Entre 7 y 8 dígitos numéricos</Text>
        )}
      </Box>

      <Box>
        <Field label="Fecha de Emisión" required invalid={!!errors.issueDate}>
          <Input
            type="date"
            value={issueDate}
            onChange={(e) => { setIssueDate(e.target.value); clearFieldError("issueDate"); }}
          />
        </Field>
        <FieldError text={errors.issueDate} />
      </Box>

      <Box>
        <Field label="Fecha de Vencimiento" required invalid={!!(errors.expiryDate || errors.dates)}>
          <Input
            type="date"
            value={expiryDate}
            onChange={(e) => { setExpiryDate(e.target.value); clearFieldError("expiryDate"); }}
          />
        </Field>
        <FieldError text={errors.expiryDate || errors.dates} />
      </Box>

      <Box>
        <Field label="Matrícula del Médico" required invalid={!!errors.doctorLicense}>
          <Input
            placeholder="Ej. MP12345"
            maxLength={10}
            value={doctorLicense}
            onChange={(e) => {
              setDoctorLicense(e.target.value);
              setErrors((prev) => ({ ...prev, doctorLicense: validateDoctorLicense(e.target.value), form: "" }));
            }}
          />
        </Field>
        <FieldError text={errors.doctorLicense} />
        {!errors.doctorLicense && (
          <Text fontSize="xs" color="fg.muted" mt="1">Hasta 10 caracteres alfanuméricos</Text>
        )}
      </Box>

      <Box>
        <Field label="Institución" required invalid={!!errors.institution}>
          <Input
            placeholder="Ej. Hospital Municipal"
            maxLength={60}
            value={institution}
            onChange={(e) => {
              setInstitution(e.target.value);
              setErrors((prev) => ({ ...prev, institution: validateInstitution(e.target.value), form: "" }));
            }}
          />
        </Field>
        <FieldError text={errors.institution} />
        {!errors.institution && (
          <Text fontSize="xs" color="fg.muted" mt="1">Hasta 60 caracteres</Text>
        )}
      </Box>

      {errors.form && (
        <Box bg="red.50" color="red.700" px="3" py="2" borderRadius="md" border="1px solid" borderColor="red.200">
          <Text fontSize="sm" fontWeight="bold">{errors.form}</Text>
        </Box>
      )}
    </Stack>
  );
});

function FieldError({ text }: { text: string }) {
  if (!text) return null;
  return (
    <Text fontSize="xs" color="red.500" mt="1" fontWeight="medium">
      {text}
    </Text>
  );
}
