export type DataAuditorSeverity = "LOW" | "MEDIUM" | "HIGH";

export type DataAuditorActionSection =
  | "basico"
  | "contacto"
  | "ubicacion"
  | "horarios"
  | "fotografias";

export type DataAuditorAction = {
  section: DataAuditorActionSection;
  field?: string;
  label: string;
};

export type DataAuditorFinding = {
  business_id: string;
  business_name?: string;
  rule: string;
  severity: DataAuditorSeverity;
  message: string;
  action?: DataAuditorAction;
};

function isActionSection(value: unknown): value is DataAuditorActionSection {
  return (
    value === "basico" ||
    value === "contacto" ||
    value === "ubicacion" ||
    value === "horarios" ||
    value === "fotografias"
  );
}

export type DataAuditorFindingsPayload = {
  source: "linaresya-data-auditor";
  generated_at: string;
  findings: DataAuditorFinding[];
};

function isSeverity(value: unknown): value is DataAuditorSeverity {
  return value === "LOW" || value === "MEDIUM" || value === "HIGH";
}

export function validateDataAuditorFindings(
  payload: unknown,
): DataAuditorFindingsPayload {
  if (!payload || typeof payload !== "object") {
    throw new Error("El reporte del Data Auditor debe ser un objeto.");
  }

  const candidate = payload as Record<string, unknown>;

  if (candidate.source !== "linaresya-data-auditor") {
    throw new Error("El reporte no pertenece al Data Auditor esperado.");
  }

  if (
    typeof candidate.generated_at !== "string" ||
    Number.isNaN(Date.parse(candidate.generated_at))
  ) {
    throw new Error("El reporte del Data Auditor debe tener generated_at ISO.");
  }

  if (!Array.isArray(candidate.findings)) {
    throw new Error("El reporte del Data Auditor debe contener findings.");
  }

  const findings = candidate.findings.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Hallazgo inválido en posición ${index}.`);
    }

    const finding = item as Record<string, unknown>;

    if (
      typeof finding.business_id !== "string" ||
      !finding.business_id.trim() ||
      typeof finding.rule !== "string" ||
      !finding.rule.trim() ||
      typeof finding.message !== "string" ||
      !finding.message.trim() ||
      !isSeverity(finding.severity)
    ) {
      throw new Error(`Hallazgo inválido en posición ${index}.`);
    }

    return {
      business_id: finding.business_id,
      ...(typeof finding.business_name === "string"
        ? { business_name: finding.business_name }
        : {}),
      rule: finding.rule,
      severity: finding.severity,
      message: finding.message,
      ...(finding.action && typeof finding.action === "object"
        ? (() => {
            const action = finding.action as Record<string, unknown>;
            if (
              !isActionSection(action.section) ||
              typeof action.label !== "string" ||
              !action.label.trim() ||
              (action.field !== undefined && typeof action.field !== "string")
            ) {
              throw new Error(
                `Acción inválida en posición ${index}.`,
              );
            }
            return {
              action: {
                section: action.section,
                ...(typeof action.field === "string" ? { field: action.field } : {}),
                label: action.label,
              },
            };
          })()
        : {}),
    };
  });

  return {
    source: "linaresya-data-auditor",
    generated_at: candidate.generated_at,
    findings,
  };
}

export async function fetchDataAuditorFindings(): Promise<DataAuditorFindingsPayload | null> {
  const url = process.env.DATA_AUDITOR_FINDINGS_URL;

  if (!url) return null;

  const response = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`No se pudo consultar el Data Auditor: HTTP ${response.status}.`);
  }

  return validateDataAuditorFindings(await response.json());
}
