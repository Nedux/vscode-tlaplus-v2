import { Location, Range } from 'vscode-languageclient/node';

export interface CountByStepStatus {
    proved: number;
    failed: number;
    omitted: number;
    missing: number;
    pending: number;
    progress: number;
}

export interface TlapsProofObligationResult {
    prover: string;
    meth: string;
    status: string;
    reason: string | null;
    obligation: string | null; // Non-null, if prover failed.
}

export interface TlapsProofObligationState {
    role: string;
    range: Range;
    status: string;
    normalized: string;
    results: TlapsProofObligationResult[];
}

export interface TlapsProofStepDetails {
    kind: string;
    status: string;
    location: Location;
    obligations: TlapsProofObligationState[];
    sub_count: CountByStepStatus;
}

export interface TlapsProofFinish {
  status: 'success' | 'failure' | 'skipped';
  reason: string;
}
