--
-- PostgreSQL database dump
--

-- Dumped from database version 12.13
-- Dumped by pg_dump version 14.13 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: transactions_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.transactions_type_enum AS ENUM (
    'BUY',
    'SELL',
    'TRANSFER_IN',
    'TRANSFER_OUT',
    'DIVIDEND',
    'STAKING_REWARD'
);


ALTER TYPE public.transactions_type_enum OWNER TO postgres;

--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_role_enum AS ENUM (
    'user',
    'moderator',
    'admin'
);


ALTER TYPE public.users_role_enum OWNER TO postgres;

--
-- Name: users_tier_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_tier_enum AS ENUM (
    'novice',
    'learner',
    'trader',
    'expert',
    'master',
    'legend'
);


ALTER TYPE public.users_tier_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: portfolio_holdings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.portfolio_holdings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "portfolioId" uuid NOT NULL,
    symbol character varying(20) NOT NULL,
    name character varying(100) NOT NULL,
    quantity numeric(20,8) DEFAULT '0'::numeric NOT NULL,
    "averagePrice" numeric(15,8) DEFAULT '0'::numeric NOT NULL,
    "totalCost" numeric(20,8) DEFAULT '0'::numeric NOT NULL,
    "currentPrice" numeric(15,8),
    "currentValue" numeric(20,8),
    "profitLoss" numeric(10,4),
    "profitLossPercentage" numeric(8,4),
    source character varying(20) DEFAULT 'MANUAL'::character varying NOT NULL,
    "externalId" character varying(50),
    "isActive" boolean DEFAULT true NOT NULL,
    "lastPriceUpdate" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.portfolio_holdings OWNER TO postgres;

--
-- Name: portfolios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.portfolios (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    "userId" uuid NOT NULL,
    "totalValue" numeric(20,8) DEFAULT '0'::numeric NOT NULL,
    "baseCurrency" character varying(10) DEFAULT 'USD'::character varying NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isPublic" boolean DEFAULT false NOT NULL,
    settings jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.portfolios OWNER TO postgres;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "holdingId" uuid NOT NULL,
    symbol character varying(20) NOT NULL,
    type public.transactions_type_enum NOT NULL,
    quantity numeric(20,8) NOT NULL,
    price numeric(15,8) NOT NULL,
    total numeric(20,8) NOT NULL,
    fees numeric(15,8) DEFAULT '0'::numeric NOT NULL,
    currency character varying(10) DEFAULT 'USD'::character varying NOT NULL,
    source character varying(20) DEFAULT 'MANUAL'::character varying NOT NULL,
    "externalId" character varying(100),
    notes character varying(200),
    "executedAt" timestamp without time zone NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying,
    password character varying,
    first_name character varying,
    last_name character varying,
    wallet_address character varying,
    wallet_network character varying,
    role public.users_role_enum DEFAULT 'user'::public.users_role_enum NOT NULL,
    tier public.users_tier_enum DEFAULT 'novice'::public.users_tier_enum NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    email_verification_token character varying,
    password_reset_token character varying,
    password_reset_expiry timestamp without time zone,
    refresh_token character varying,
    auth_provider character varying,
    auth_provider_id character varying,
    two_factor_enabled boolean DEFAULT false NOT NULL,
    two_factor_secret character varying,
    is_active boolean DEFAULT true NOT NULL,
    last_login_at timestamp without time zone,
    login_count integer DEFAULT 0 NOT NULL,
    profile_picture character varying,
    bio text,
    timezone character varying,
    language character varying,
    notification_preferences jsonb,
    privacy_settings jsonb,
    knowledge_score integer DEFAULT 0 NOT NULL,
    investment_score integer DEFAULT 0 NOT NULL,
    reputation_score integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1751211146572	InitialSchema1751211146572
\.


--
-- Data for Name: portfolio_holdings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.portfolio_holdings (id, "portfolioId", symbol, name, quantity, "averagePrice", "totalCost", "currentPrice", "currentValue", "profitLoss", "profitLossPercentage", source, "externalId", "isActive", "lastPriceUpdate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: portfolios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.portfolios (id, name, description, "userId", "totalValue", "baseCurrency", "isActive", "isPublic", settings, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, "holdingId", symbol, type, quantity, price, total, fees, currency, source, "externalId", notes, "executedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, first_name, last_name, wallet_address, wallet_network, role, tier, email_verified, email_verification_token, password_reset_token, password_reset_expiry, refresh_token, auth_provider, auth_provider_id, two_factor_enabled, two_factor_secret, is_active, last_login_at, login_count, profile_picture, bio, timezone, language, notification_preferences, privacy_settings, knowledge_score, investment_score, reputation_score, created_at, updated_at) FROM stdin;
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 1, true);


--
-- Name: portfolios PK_488aa6e9b219d1d9087126871ae; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT "PK_488aa6e9b219d1d9087126871ae" PRIMARY KEY (id);


--
-- Name: portfolio_holdings PK_791e8293470395842404d51142f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolio_holdings
    ADD CONSTRAINT "PK_791e8293470395842404d51142f" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: transactions PK_a219afd8dd77ed80f5a862f1db9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: users UQ_196ef3e52525d3cd9e203bdb1de; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_196ef3e52525d3cd9e203bdb1de" UNIQUE (wallet_address);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: IDX_2632abf3305c87cbd0a37f323a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_2632abf3305c87cbd0a37f323a" ON public.portfolio_holdings USING btree (symbol, "isActive");


--
-- Name: IDX_3934dcdf81c21581c8ecd66279; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_3934dcdf81c21581c8ecd66279" ON public.transactions USING btree (symbol, "executedAt");


--
-- Name: IDX_64d7da1c653c2f4bd036f417ab; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_64d7da1c653c2f4bd036f417ab" ON public.transactions USING btree ("holdingId", type);


--
-- Name: IDX_65cbf5fcb331619593ee334c7c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_65cbf5fcb331619593ee334c7c" ON public.users USING btree (email) WHERE (email IS NOT NULL);


--
-- Name: IDX_7038d44154f0e1c8213352b403; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_7038d44154f0e1c8213352b403" ON public.users USING btree (wallet_address) WHERE (wallet_address IS NOT NULL);


--
-- Name: IDX_ac6477220567face635ee0a904; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_ac6477220567face635ee0a904" ON public.transactions USING btree ("executedAt");


--
-- Name: IDX_b69af20373681a33c450d64253; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b69af20373681a33c450d64253" ON public.portfolio_holdings USING btree ("portfolioId", symbol);


--
-- Name: IDX_bda8b3b33ae4548448cc0535fc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_bda8b3b33ae4548448cc0535fc" ON public.portfolios USING btree ("userId", "isActive");


--
-- Name: portfolio_holdings FK_65b5e59d80a8a0fd9044c1ea32c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolio_holdings
    ADD CONSTRAINT "FK_65b5e59d80a8a0fd9044c1ea32c" FOREIGN KEY ("portfolioId") REFERENCES public.portfolios(id) ON DELETE CASCADE;


--
-- Name: transactions FK_992185d0ef0eb0d5a387cf57846; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "FK_992185d0ef0eb0d5a387cf57846" FOREIGN KEY ("holdingId") REFERENCES public.portfolio_holdings(id) ON DELETE CASCADE;


--
-- Name: portfolios FK_e4e66691a2634fcf5525e33ecf5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT "FK_e4e66691a2634fcf5525e33ecf5" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

