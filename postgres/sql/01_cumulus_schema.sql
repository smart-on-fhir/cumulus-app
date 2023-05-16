--
-- PostgreSQL database dump
--

-- Dumped from database version 14.7 (Debian 14.7-1.pgdg110+1)
-- Dumped by pg_dump version 15.2

-- Started on 2023-04-16 12:21:50 PDT

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
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 843 (class 1247 OID 16451)
-- Name: enum_DataRequests_refresh; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_DataRequests_refresh" AS ENUM (
    'manually',
    'yearly',
    'monthly',
    'weekly',
    'daily'
);


ALTER TYPE public."enum_DataRequests_refresh" OWNER TO postgres;

--
-- TOC entry 840 (class 1247 OID 16386)
-- Name: enum_Users_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Users_role" AS ENUM (
    'user',
    'manager',
    'admin'
);


ALTER TYPE public."enum_Users_role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 214 (class 1259 OID 16712)
-- Name: Activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Activities" (
    id integer NOT NULL,
    type character varying(255),
    message character varying(255),
    tags character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Activities" OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 16711)
-- Name: Activities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Activities_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Activities_id_seq" OWNER TO postgres;

--
-- TOC entry 3414 (class 0 OID 0)
-- Dependencies: 213
-- Name: Activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Activities_id_seq" OWNED BY public."Activities".id;


--
-- TOC entry 220 (class 1259 OID 16743)
-- Name: DataRequests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DataRequests" (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    refresh public."enum_DataRequests_refresh" DEFAULT 'manually'::public."enum_DataRequests_refresh" NOT NULL,
    completed timestamp with time zone,
    "requestedData" jsonb,
    metadata jsonb,
    data jsonb,
    "groupId" integer,
    "dataURL" character varying(500),
    transmissions jsonb,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."DataRequests" OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16810)
-- Name: DataRequestsTags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DataRequestsTags" (
    "DataRequestId" integer NOT NULL,
    "TagId" integer NOT NULL
);


ALTER TABLE public."DataRequestsTags" OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16742)
-- Name: DataRequests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."DataRequests_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."DataRequests_id_seq" OWNER TO postgres;

--
-- TOC entry 3415 (class 0 OID 0)
-- Dependencies: 219
-- Name: DataRequests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."DataRequests_id_seq" OWNED BY public."DataRequests".id;


--
-- TOC entry 216 (class 1259 OID 16721)
-- Name: DataSites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DataSites" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255),
    lat integer,
    long integer,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."DataSites" OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16720)
-- Name: DataSites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."DataSites_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."DataSites_id_seq" OWNER TO postgres;

--
-- TOC entry 3416 (class 0 OID 0)
-- Dependencies: 215
-- Name: DataSites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."DataSites_id_seq" OWNED BY public."DataSites".id;


--
-- TOC entry 222 (class 1259 OID 16758)
-- Name: Projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Projects" (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text NOT NULL,
    "creatorId" integer NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."Projects" OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16780)
-- Name: ProjectsSubscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProjectsSubscriptions" (
    "ProjectId" integer NOT NULL,
    "DataRequestId" integer NOT NULL
);


ALTER TABLE public."ProjectsSubscriptions" OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16757)
-- Name: Projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Projects_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Projects_id_seq" OWNER TO postgres;

--
-- TOC entry 3417 (class 0 OID 0)
-- Dependencies: 221
-- Name: Projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Projects_id_seq" OWNED BY public."Projects".id;


--
-- TOC entry 218 (class 1259 OID 16732)
-- Name: RequestGroups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RequestGroups" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."RequestGroups" OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16731)
-- Name: RequestGroups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."RequestGroups_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."RequestGroups_id_seq" OWNER TO postgres;

--
-- TOC entry 3418 (class 0 OID 0)
-- Dependencies: 217
-- Name: RequestGroups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."RequestGroups_id_seq" OWNED BY public."RequestGroups".id;


--
-- TOC entry 212 (class 1259 OID 16700)
-- Name: Tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Tags" (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(200) NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "creatorId" integer
);


ALTER TABLE public."Tags" OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 16699)
-- Name: Tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Tags_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Tags_id_seq" OWNER TO postgres;

--
-- TOC entry 3419 (class 0 OID 0)
-- Dependencies: 211
-- Name: Tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Tags_id_seq" OWNED BY public."Tags".id;


--
-- TOC entry 210 (class 1259 OID 16686)
-- Name: Users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Users" (
    id integer NOT NULL,
    email character varying(100) NOT NULL,
    name character varying(100),
    password character varying(100),
    role public."enum_Users_role" DEFAULT 'user'::public."enum_Users_role" NOT NULL,
    sid character varying(255),
    "lastLogin" timestamp with time zone,
    "activationCode" character varying(255),
    "invitedBy" character varying(255),
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."Users" OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 16685)
-- Name: Users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Users_id_seq" OWNER TO postgres;

--
-- TOC entry 3420 (class 0 OID 0)
-- Dependencies: 209
-- Name: Users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Users_id_seq" OWNED BY public."Users".id;


--
-- TOC entry 224 (class 1259 OID 16767)
-- Name: Views; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Views" (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(500),
    "screenShot" text,
    settings jsonb,
    "DataRequestId" integer,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."Views" OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16795)
-- Name: ViewsTags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ViewsTags" (
    "ViewId" integer NOT NULL,
    "TagId" integer NOT NULL
);


ALTER TABLE public."ViewsTags" OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16766)
-- Name: Views_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Views_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Views_id_seq" OWNER TO postgres;

--
-- TOC entry 3421 (class 0 OID 0)
-- Dependencies: 223
-- Name: Views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Views_id_seq" OWNED BY public."Views".id;


--
-- TOC entry 3223 (class 2604 OID 16715)
-- Name: Activities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Activities" ALTER COLUMN id SET DEFAULT nextval('public."Activities_id_seq"'::regclass);


--
-- TOC entry 3226 (class 2604 OID 16746)
-- Name: DataRequests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DataRequests" ALTER COLUMN id SET DEFAULT nextval('public."DataRequests_id_seq"'::regclass);


--
-- TOC entry 3224 (class 2604 OID 16724)
-- Name: DataSites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DataSites" ALTER COLUMN id SET DEFAULT nextval('public."DataSites_id_seq"'::regclass);


--
-- TOC entry 3228 (class 2604 OID 16761)
-- Name: Projects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Projects" ALTER COLUMN id SET DEFAULT nextval('public."Projects_id_seq"'::regclass);


--
-- TOC entry 3225 (class 2604 OID 16735)
-- Name: RequestGroups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestGroups" ALTER COLUMN id SET DEFAULT nextval('public."RequestGroups_id_seq"'::regclass);


--
-- TOC entry 3222 (class 2604 OID 16703)
-- Name: Tags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tags" ALTER COLUMN id SET DEFAULT nextval('public."Tags_id_seq"'::regclass);


--
-- TOC entry 3220 (class 2604 OID 16689)
-- Name: Users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users" ALTER COLUMN id SET DEFAULT nextval('public."Users_id_seq"'::regclass);


--
-- TOC entry 3229 (class 2604 OID 16770)
-- Name: Views id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Views" ALTER COLUMN id SET DEFAULT nextval('public."Views_id_seq"'::regclass);


--
-- TOC entry 3239 (class 2606 OID 16719)
-- Name: Activities Activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Activities"
    ADD CONSTRAINT "Activities_pkey" PRIMARY KEY (id);


--
-- TOC entry 3259 (class 2606 OID 16814)
-- Name: DataRequestsTags DataRequestsTags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DataRequestsTags"
    ADD CONSTRAINT "DataRequestsTags_pkey" PRIMARY KEY ("DataRequestId", "TagId");


--
-- TOC entry 3249 (class 2606 OID 16751)
-- Name: DataRequests DataRequests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DataRequests"
    ADD CONSTRAINT "DataRequests_pkey" PRIMARY KEY (id);


--
-- TOC entry 3241 (class 2606 OID 16730)
-- Name: DataSites DataSites_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DataSites"
    ADD CONSTRAINT "DataSites_name_key" UNIQUE (name);


--
-- TOC entry 3243 (class 2606 OID 16728)
-- Name: DataSites DataSites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DataSites"
    ADD CONSTRAINT "DataSites_pkey" PRIMARY KEY (id);


--
-- TOC entry 3255 (class 2606 OID 16784)
-- Name: ProjectsSubscriptions ProjectsSubscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectsSubscriptions"
    ADD CONSTRAINT "ProjectsSubscriptions_pkey" PRIMARY KEY ("ProjectId", "DataRequestId");


--
-- TOC entry 3251 (class 2606 OID 16765)
-- Name: Projects Projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Projects"
    ADD CONSTRAINT "Projects_pkey" PRIMARY KEY (id);


--
-- TOC entry 3245 (class 2606 OID 16741)
-- Name: RequestGroups RequestGroups_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestGroups"
    ADD CONSTRAINT "RequestGroups_name_key" UNIQUE (name);


--
-- TOC entry 3247 (class 2606 OID 16739)
-- Name: RequestGroups RequestGroups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestGroups"
    ADD CONSTRAINT "RequestGroups_pkey" PRIMARY KEY (id);


--
-- TOC entry 3237 (class 2606 OID 16705)
-- Name: Tags Tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tags"
    ADD CONSTRAINT "Tags_pkey" PRIMARY KEY (id);


--
-- TOC entry 3231 (class 2606 OID 16698)
-- Name: Users Users_activationCode_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_activationCode_key" UNIQUE ("activationCode");


--
-- TOC entry 3233 (class 2606 OID 16696)
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- TOC entry 3235 (class 2606 OID 16694)
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- TOC entry 3257 (class 2606 OID 16799)
-- Name: ViewsTags ViewsTags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ViewsTags"
    ADD CONSTRAINT "ViewsTags_pkey" PRIMARY KEY ("ViewId", "TagId");


--
-- TOC entry 3253 (class 2606 OID 16774)
-- Name: Views Views_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Views"
    ADD CONSTRAINT "Views_pkey" PRIMARY KEY (id);


--
-- TOC entry 3267 (class 2606 OID 16815)
-- Name: DataRequestsTags DataRequestsTags_DataRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DataRequestsTags"
    ADD CONSTRAINT "DataRequestsTags_DataRequestId_fkey" FOREIGN KEY ("DataRequestId") REFERENCES public."DataRequests"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3268 (class 2606 OID 16820)
-- Name: DataRequestsTags DataRequestsTags_TagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DataRequestsTags"
    ADD CONSTRAINT "DataRequestsTags_TagId_fkey" FOREIGN KEY ("TagId") REFERENCES public."Tags"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3261 (class 2606 OID 16752)
-- Name: DataRequests DataRequests_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DataRequests"
    ADD CONSTRAINT "DataRequests_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."RequestGroups"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3263 (class 2606 OID 16790)
-- Name: ProjectsSubscriptions ProjectsSubscriptions_DataRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectsSubscriptions"
    ADD CONSTRAINT "ProjectsSubscriptions_DataRequestId_fkey" FOREIGN KEY ("DataRequestId") REFERENCES public."DataRequests"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3264 (class 2606 OID 16785)
-- Name: ProjectsSubscriptions ProjectsSubscriptions_ProjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectsSubscriptions"
    ADD CONSTRAINT "ProjectsSubscriptions_ProjectId_fkey" FOREIGN KEY ("ProjectId") REFERENCES public."Projects"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3260 (class 2606 OID 16706)
-- Name: Tags Tags_creatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tags"
    ADD CONSTRAINT "Tags_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3265 (class 2606 OID 16805)
-- Name: ViewsTags ViewsTags_TagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ViewsTags"
    ADD CONSTRAINT "ViewsTags_TagId_fkey" FOREIGN KEY ("TagId") REFERENCES public."Tags"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3266 (class 2606 OID 16800)
-- Name: ViewsTags ViewsTags_ViewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ViewsTags"
    ADD CONSTRAINT "ViewsTags_ViewId_fkey" FOREIGN KEY ("ViewId") REFERENCES public."Views"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3262 (class 2606 OID 16775)
-- Name: Views Views_DataRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Views"
    ADD CONSTRAINT "Views_DataRequestId_fkey" FOREIGN KEY ("DataRequestId") REFERENCES public."DataRequests"(id) ON UPDATE CASCADE;


--
-- TOC entry 3413 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


-- Completed on 2023-04-16 12:21:50 PDT

--
-- PostgreSQL database dump complete
--

