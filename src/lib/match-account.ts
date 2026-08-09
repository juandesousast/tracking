import { Account, PropFirm } from "@/types/database";

export interface MatchAccountResult {
  matchedFirmId?: string;
  matchedAccountId?: string;
  candidateAccounts: Account[];
  hasAmbiguity: boolean;
}

export function matchAccountFromScan(
  scannedFirmName: string | undefined | null,
  scannedAccountNumber: string | undefined | null,
  scannedAlias: string | undefined | null,
  accounts: Account[],
  firms: PropFirm[]
): MatchAccountResult {
  if (!scannedFirmName && !scannedAccountNumber && !scannedAlias) {
    return {
      candidateAccounts: [],
      hasAmbiguity: false,
    };
  }

  // 1. Find firm matching scannedFirmName (if provided)
  const matchedFirm = scannedFirmName
    ? firms.find(
        (f) =>
          f.name.toLowerCase().includes(scannedFirmName.toLowerCase()) ||
          scannedFirmName.toLowerCase().includes(f.name.toLowerCase())
      )
    : undefined;

  const firmId = matchedFirm?.id;

  // a) Buscar cuenta que coincida por firm_id Y (account_number o alias)
  if (scannedAccountNumber || scannedAlias) {
    const exactMatch = accounts.find((acc) => {
      const matchFirm = firmId ? acc.firm_id === firmId : true;
      const matchAccNum =
        scannedAccountNumber && acc.account_number
          ? acc.account_number.toLowerCase() === scannedAccountNumber.toLowerCase()
          : false;
      const matchAlias =
        scannedAlias && acc.alias
          ? acc.alias.toLowerCase() === scannedAlias.toLowerCase()
          : false;
      return matchFirm && (matchAccNum || matchAlias);
    });

    if (exactMatch) {
      const actualFirmId = firmId || exactMatch.firm_id;
      const activeForFirm = accounts.filter(
        (acc) => acc.firm_id === actualFirmId && acc.status?.toLowerCase() === "active"
      );
      return {
        matchedFirmId: actualFirmId,
        matchedAccountId: exactMatch.id,
        candidateAccounts: activeForFirm,
        hasAmbiguity: false,
      };
    }
  }

  // b) Si no hay coincidencia exacta de ID, filtrar cuentas de esa firma con status.toLowerCase() === 'active'
  if (firmId) {
    const activeAccounts = accounts.filter(
      (acc) => acc.firm_id === firmId && acc.status?.toLowerCase() === "active"
    );

    // c) Si exactamente 1 cuenta activa -> matchedAccountId
    if (activeAccounts.length === 1) {
      return {
        matchedFirmId: firmId,
        matchedAccountId: activeAccounts[0].id,
        candidateAccounts: activeAccounts,
        hasAmbiguity: false,
      };
    }

    // d) Si múltiples cuentas activas -> candidateAccounts: Account[]
    if (activeAccounts.length > 1) {
      return {
        matchedFirmId: firmId,
        matchedAccountId: undefined,
        candidateAccounts: activeAccounts,
        hasAmbiguity: true,
      };
    }

    return {
      matchedFirmId: firmId,
      matchedAccountId: undefined,
      candidateAccounts: [],
      hasAmbiguity: false,
    };
  }

  return {
    candidateAccounts: [],
    hasAmbiguity: false,
  };
}
