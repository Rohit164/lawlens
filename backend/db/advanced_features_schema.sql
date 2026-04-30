-- Advanced Features Database Schema for LawLens (PostgreSQL/Neon DB)
-- Run this to add tables for storing AI-generated results

-- Judge Features Tables

CREATE TABLE IF NOT EXISTS bench_memos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    case_id VARCHAR(255),
    case_file TEXT NOT NULL,
    memo_data JSONB NOT NULL,
    processing_time FLOAT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hearing_preparations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    case_id VARCHAR(255),
    case_file TEXT NOT NULL,
    hearing_history TEXT,
    preparation_data JSONB NOT NULL,
    processing_time FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS judgment_drafts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    case_id VARCHAR(255),
    case_analysis TEXT NOT NULL,
    issue TEXT NOT NULL,
    draft_data JSONB NOT NULL,
    override_log JSONB DEFAULT '[]'::jsonb,
    version INTEGER DEFAULT 1,
    processing_time FLOAT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS multi_bench_consensus (
    id SERIAL PRIMARY KEY,
    case_id VARCHAR(255),
    opinions JSONB NOT NULL,
    consensus_analysis JSONB NOT NULL,
    processing_time FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cause_list_optimizations (
    id SERIAL PRIMARY KEY,
    court_id VARCHAR(255),
    cases_data JSONB NOT NULL,
    optimization_data JSONB NOT NULL,
    processing_time FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Lawyer Features Tables

CREATE TABLE IF NOT EXISTS adversarial_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    case_id VARCHAR(255),
    case_brief TEXT NOT NULL,
    user_arguments TEXT NOT NULL,
    analysis_data JSONB NOT NULL,
    processing_time FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS judge_analytics_queries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    judge_name VARCHAR(255),
    court VARCHAR(255),
    analytics_data JSONB NOT NULL,
    processing_time FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS real_time_assistance_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    query TEXT NOT NULL,
    context TEXT,
    assistance_data JSONB NOT NULL,
    processing_time FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics Features Tables

CREATE TABLE IF NOT EXISTS litigation_forecasts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    case_id VARCHAR(255),
    case_details TEXT NOT NULL,
    forecast_data JSONB NOT NULL,
    confidence_level VARCHAR(50),
    processing_time FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_scans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    document_type VARCHAR(100),
    filing_text TEXT NOT NULL,
    scan_results JSONB NOT NULL,
    issues_found INTEGER DEFAULT 0,
    severity_high INTEGER DEFAULT 0,
    severity_medium INTEGER DEFAULT 0,
    severity_low INTEGER DEFAULT 0,
    processing_time FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS counterfactual_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    case_id VARCHAR(255),
    case_details TEXT NOT NULL,
    what_if_scenario TEXT NOT NULL,
    analysis_data JSONB NOT NULL,
    processing_time FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS precedent_impact_tracking (
    id SERIAL PRIMARY KEY,
    case_citation VARCHAR(500) NOT NULL,
    impact_data JSONB NOT NULL,
    last_updated TIMESTAMP DEFAULT NOW(),
    processing_time FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit & Compliance Tables

CREATE TABLE IF NOT EXISTS ai_overrides (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    feature_type VARCHAR(100) NOT NULL,
    feature_id INTEGER,
    original_suggestion TEXT NOT NULL,
    user_override TEXT NOT NULL,
    reason TEXT,
    confidence_before FLOAT,
    confidence_after FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fairness_audits (
    id SERIAL PRIMARY KEY,
    audit_type VARCHAR(100) NOT NULL,
    audit_period_start TIMESTAMP,
    audit_period_end TIMESTAMP,
    metrics JSONB NOT NULL,
    findings JSONB,
    recommendations JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_usage_analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    feature_name VARCHAR(100) NOT NULL,
    feature_category VARCHAR(50),
    usage_count INTEGER DEFAULT 1,
    total_processing_time FLOAT DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_used TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Preferences for Advanced Features

CREATE TABLE IF NOT EXISTS user_feature_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE,
    preferred_role VARCHAR(50),
    favorite_features JSONB DEFAULT '[]'::jsonb,
    notification_preferences JSONB DEFAULT '{}'::jsonb,
    ui_preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Indexes (after all tables are created)

CREATE INDEX IF NOT EXISTS idx_bench_memos_user ON bench_memos(user_id);
CREATE INDEX IF NOT EXISTS idx_bench_memos_case ON bench_memos(case_id);
CREATE INDEX IF NOT EXISTS idx_hearing_prep_user ON hearing_preparations(user_id);
CREATE INDEX IF NOT EXISTS idx_judgment_drafts_user ON judgment_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_judgment_drafts_case ON judgment_drafts(case_id);
CREATE INDEX IF NOT EXISTS idx_adversarial_user ON adversarial_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_judge_analytics_user ON judge_analytics_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_real_time_user ON real_time_assistance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_litigation_forecasts_user ON litigation_forecasts(user_id);
CREATE INDEX IF NOT EXISTS idx_litigation_forecasts_case ON litigation_forecasts(case_id);
CREATE INDEX IF NOT EXISTS idx_compliance_scans_user ON compliance_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_counterfactual_user ON counterfactual_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_precedent_citation ON precedent_impact_tracking(case_citation);
CREATE INDEX IF NOT EXISTS idx_ai_overrides_user ON ai_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_overrides_feature ON ai_overrides(feature_type);
CREATE INDEX IF NOT EXISTS idx_fairness_audits_type ON fairness_audits(audit_type);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user ON feature_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature ON feature_usage_analytics(feature_name);
CREATE INDEX IF NOT EXISTS idx_user_preferences ON user_feature_preferences(user_id);
