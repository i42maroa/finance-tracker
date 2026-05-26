# Finance Tracker - Stack tecnico

## Frontend

- Framework: Angular 21
- Lenguaje: TypeScript
- Arquitectura Angular: componentes standalone
- Routing: Angular Router
- Estado local: Angular Signals
- Formularios: Angular Reactive Forms
- Estilos: Tailwind CSS
- Enfoque de interfaz: responsive con criterio mobile first

## Backend

- Backend principal: Supabase
- Autenticacion: Supabase Auth
- Login principal: Google OAuth
- Cliente frontend: `@supabase/supabase-js`
- API: APIs generadas por Supabase sobre PostgreSQL

## Base de datos

- Motor: PostgreSQL gestionado por Supabase
- Seguridad: Row Level Security en tablas con datos de usuario
- Moneda inicial: EUR
- Almacenamiento de importes: centimos como enteros

## Storage

- Servicio opcional: Supabase Storage
- Uso previsto: tickets, facturas o justificantes en versiones futuras

## PWA

- PWA no forma parte del stack inicial.
- Se mantiene como mejora tecnica futura no prioritaria.

## Estructura frontend

```text
src/
  app/
    core/
      auth/
      supabase/
      guards/
    features/
      dashboard/
      transactions/
      investments/
      accounts/
      budgets/
      settings/
    shared/
      ui/
      utils/
      models/
```

## Stack final

- Angular 21
- TypeScript
- Tailwind CSS
- Supabase
- Supabase Auth con Google OAuth
- PostgreSQL en Supabase
- Row Level Security
- `@supabase/supabase-js`
