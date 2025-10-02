import { Router, Request, Response } from "express";
import { requireWriteConfirm } from "../middleware/safeMode";
import pg from "pg";
const { Pool } = pg;

const router = Router();

const DDL = `
create table if not exists units(
  id serial primary key,
  code text unique not null,
  name text not null
);

create table if not exists unit_conversions(
  id serial primary key,
  from_unit int references units(id),
  to_unit int references units(id),
  factor numeric(18,6) not null
);

create table if not exists suppliers(
  id serial primary key,
  name text not null,
  code text unique,
  phone text,
  email text
);

create table if not exists categories(
  id serial primary key,
  name text not null,
  kind text not null
);

create table if not exists ingredients(
  id serial primary key,
  name text not null,
  code text unique,
  category_id int references categories(id),
  base_unit int references units(id),
  is_active boolean default true
);

create table if not exists ingredient_prices(
  id serial primary key,
  ingredient_id int references ingredients(id),
  supplier_id int references suppliers(id),
  price numeric(18,6) not null,
  currency text default 'EUR',
  pack_unit int references units(id),
  pack_qty numeric(18,6) default 1,
  valid_from date not null default current_date
);

create index if not exists idx_ing_prices_uniq
  on ingredient_prices(ingredient_id, supplier_id, valid_from);

create table if not exists recipes(
  id serial primary key,
  name text unique not null,
  category_id int references categories(id),
  type text default 'dish',                 -- 'prep' | 'dish'
  yield_qty numeric(18,6) default 1,
  yield_unit int references units(id),
  loss_pct numeric(5,2) default 0,
  is_active boolean default true
);

create table if not exists recipe_components(
  id serial primary key,
  recipe_id int references recipes(id),
  component_type text not null,            -- 'ingredient' | 'subrecipe'
  ingredient_id int references ingredients(id),
  subrecipe_id int references recipes(id),
  qty numeric(18,6) not null,
  unit int references units(id),
  check ((component_type='ingredient' and ingredient_id is not null and subrecipe_id is null)
      or (component_type='subrecipe' and subrecipe_id is not null and ingredient_id is null))
);

-- опционально: снимки себестоимости заготовок
create table if not exists recipe_cost_snapshots(
  id serial primary key,
  recipe_id int references recipes(id),
  as_of_date date not null default current_date,
  unit_cost numeric(18,6) not null,
  note text
);
`;

router.post("/api/db/apply-ddl", requireWriteConfirm, async (req: Request, res: Response) => {
  const url = process.env.DATABASE_URL;
  if (!url) return res.status(500).json({ error: "DATABASE_URL is not set" });
  const pool = new Pool({ connectionString: url });
  try {
    await pool.query("begin");
    await pool.query(DDL);
    await pool.query("commit");
    res.json({ ok: true, applied: true });
  } catch (e:any) {
    await pool.query("rollback").catch(()=>{});
    console.error("DDL error:", e);
    res.status(500).json({ error: e.message || "DDL failed" });
  } finally {
    pool.end().catch(()=>{});
  }
});

export default router;
