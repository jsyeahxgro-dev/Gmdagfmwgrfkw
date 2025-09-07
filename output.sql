--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (84ade85)
-- Dumped by pg_dump version 16.9

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: players; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.players (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    skywars_tier text DEFAULT 'NR'::text NOT NULL,
    midfight_tier text DEFAULT 'NR'::text NOT NULL,
    uhc_tier text DEFAULT 'NR'::text NOT NULL,
    nodebuff_tier text DEFAULT 'NR'::text NOT NULL,
    bedfight_tier text DEFAULT 'NR'::text NOT NULL
);


ALTER TABLE public.players OWNER TO neondb_owner;

--
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.players (id, name, skywars_tier, midfight_tier, uhc_tier, nodebuff_tier, bedfight_tier) FROM stdin;
a84a8bee-c0e1-4c92-b437-886fd4ffbe3d	Torqueyckpio	MIDT1	HT2	HT3	NR	LT1
4809537b-cf26-4f32-87fa-793490b326d5	RivaV0cals	HT1	HT3	HT2	NR	NR
f76935dd-c7d2-4986-b454-9b0db357940c	ItzAaronHi	HT2	MIDT2	LT1	NR	NR
d3cefaeb-eef6-45b1-af1a-510cd833d9ef	Mikeyandroid	MIDT2	HT3	LT2	NR	LT1
e276ab15-eb96-4928-b2fb-2324e9d7bdcc	EletricHayden	HT3	MIDT3	NR	NR	NR
9ce5bfec-c9e5-4f48-9071-89123131f6ff	FlamePvPs	MIDT3	LT2	LT3	NR	NR
106c35d8-aaa6-44a1-aaf9-cb791d7793a3	ComicBiscuit778	LT1	LT4	NR	NR	NR
6c557cc0-3da1-4e53-9308-29e504d355b1	EfrazBR	NR	NR	NR	LT1	LT3
ec372ca2-2675-45b8-bbda-185959f92383	D3j4411	NR	NR	NR	LT4	NR
524fe63f-c753-4b1c-bae1-6621b093a321	Velfair	NR	NR	NR	MT4	NR
88631d84-060a-4e94-9af7-33f3ee02f664	zAmqni	LT3	NR	MIDT1	HT3	NR
754b1b2e-434b-46fc-8304-11e7aec4ee29	DR0IDv	NR	NR	MT1	NR	NR
79b54390-b9ab-4e07-8a1d-8a6989b89b56	Rivav0cals	NR	NR	NR	HT3	NR
\.


--
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

