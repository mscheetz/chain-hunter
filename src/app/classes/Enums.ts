
export enum AccountType {
    Basic,
    Advanced,
    Trial,
    Admin
}

export enum Interval {
    Second,
    Minute,
    Hour,
    Day
}

export enum ResultType {
    nothing = 1,
    address = 2,
    transaction = 4,
    contract = 8,
    block = 16,
    blocks = 32
}

export enum Severity {
    success,
    info,
    warn,
    error,
    custom
}