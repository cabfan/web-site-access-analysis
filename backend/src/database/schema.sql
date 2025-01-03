CREATE TABLE IF NOT EXISTS analysis_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT NOT NULL,
    server_ip TEXT NOT NULL,
    log_date DATE NOT NULL,
    analysis_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_requests INTEGER,
    unique_ips INTEGER,
    suspicious_requests INTEGER,
    analysis_data JSON,
    summary TEXT
);

CREATE TABLE IF NOT EXISTS log_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT NOT NULL,
    log_type TEXT NOT NULL,
    processed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    file_size INTEGER,
    date_range_start DATETIME,
    date_range_end DATETIME
); 