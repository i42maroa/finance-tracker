# Finance Tracker - Contexto del proyecto

## Vision del proyecto

`finance-tracker` es una aplicacion web para registrar gastos, ingresos e inversiones personales. El objetivo principal es llevar un control financiero del dia a dia desde el movil, con una experiencia mobile first, sencilla y rapida.

La aplicacion debe ser escalable desde el inicio para que pueda ser utilizada por mas de una persona, empezando por el usuario principal y su pareja.

## Principios del producto

- Mobile first como enfoque principal de diseno y experiencia de usuario.
- Acceso web desde movil, tablet y escritorio.
- Experiencia simple para registrar movimientos rapidamente.
- Datos financieros privados y protegidos por usuario.
- Soporte inicial exclusivo para EUR.
- Arquitectura preparada para crecer sin necesidad de rehacer la base del proyecto.
- Posibilidad de evolucionar hacia funcionalidades compartidas entre pareja o unidad familiar.

## Modelo multiusuario

La aplicacion debe estar preparada para que varias personas puedan usarla de forma independiente o compartida.

Modelo recomendado:

- Cada usuario inicia sesion con Google.
- Cada usuario tiene un registro en `profiles`.
- Los datos financieros pertenecen a una `household`.
- Una `household` puede tener uno o varios miembros.
- Las cuentas, categorias, transacciones y presupuestos se asocian a una `household`.
- Las inversiones pueden ser compartidas por la `household` o individuales de un usuario.
- Las inversiones individuales mantienen un usuario propietario, pero son visibles para los miembros de la `household`.

Este modelo permite:

- Uso individual.
- Uso compartido con la pareja.
- Futuro soporte para familias o grupos pequenos.
- Separar permisos por miembro si mas adelante fuese necesario.

## Entidades iniciales recomendadas

- `profiles`: perfil de usuario asociado a Supabase Auth.
- `households`: unidad compartida, por ejemplo una pareja o familia.
- `household_members`: relacion entre usuarios y unidades compartidas.
- `accounts`: cuentas financieras, como banco, efectivo, tarjeta o ahorro.
- `categories`: categorias de gasto o ingreso, incluyendo categorias base y categorias personalizadas compartidas por household.
- `transactions`: gastos e ingresos del dia a dia.
- `investment_accounts`: cuentas o plataformas de inversion.
- `investment_assets`: activos de inversion, como crypto o fondos indexados.
- `investment_transactions`: compras, ventas, aportaciones o retiradas de inversiones.
- `budgets`: presupuestos mensuales por categoria.
- `recurring_transactions`: movimientos recurrentes, como nomina, alquiler o suscripciones.
- `attachments`: adjuntos opcionales para tickets, facturas o documentos.

## Autenticacion

La autenticacion se realizara con Google OAuth a traves de Supabase Auth.

Requisitos:

- Login sencillo con cuenta de Google.
- Creacion automatica del perfil de usuario tras el primer inicio de sesion.
- Vinculacion del usuario a una `household`.
- Sesion persistente en movil.
- Rutas privadas protegidas en Angular.

## Seguridad y privacidad

La seguridad de datos debe basarse en Row Level Security de Supabase.

Reglas principales:

- Un usuario solo puede acceder a datos de las `households` de las que es miembro.
- Todas las tablas con informacion financiera deben tener RLS activado.
- Las operaciones de lectura, insercion, actualizacion y borrado deben comprobar pertenencia a la `household`.
- No se debe confiar en el frontend para proteger datos sensibles.

## Moneda e importes

La aplicacion manejara exclusivamente EUR en la primera version.

Decisiones:

- Todos los importes se guardaran en EUR.
- Se recomienda guardar importes en centimos como enteros para evitar errores de precision.
- Ejemplo: `1234` representa `12.34 EUR`.

## Gastos e ingresos

La entidad principal de uso diario sera `transactions`.

Las categorias de gasto e ingreso tendran dos origenes:

- Categorias base por defecto.
- Categorias personalizadas creadas dentro de una `household`.

Las categorias personalizadas seran compartidas por todos los miembros de la `household`.

Campos recomendados:

- Identificador
- Household
- Cuenta
- Categoria
- Tipo: gasto o ingreso
- Importe en centimos
- Moneda: EUR
- Fecha
- Descripcion
- Notas opcionales
- Usuario que creo el movimiento
- Fecha de creacion
- Fecha de actualizacion

Funcionalidad actual de movimientos:

- El listado de transacciones soporta filtros por rango de fecha, categoria, household, descripcion/nombre y tipo.
- Los filtros se muestran ocultos inicialmente y se despliegan desde un boton.
- La carga inicial del listado muestra hasta 20 transacciones.
- Si hay mas resultados, se usa un boton de cargar mas que anade el siguiente bloque de transacciones al final de la lista.
- Las llamadas del servicio de transacciones estan preparadas con contrato de filtros y paginacion aunque actualmente usen datos mockeados.

## Modales

La aplicacion utiliza un modal global montado en la raiz de la aplicacion.

Decisiones:

- El modal se abre a traves de un servicio tipado.
- El contenido del modal se decide por un tipo predefinido.
- Los templates actuales de modal incluyen crear/editar transaccion, crear household e invitar miembro.
- Las pantallas de feature no deben montar su propio contenedor `<app-modal>`.

## Inversiones

La aplicacion debe reflejar inversiones como crypto y fondos indexados.

Las inversiones podran tener dos alcances:

- Compartidas por la `household`.
- Individuales, asociadas a un usuario propietario.

Las inversiones individuales seran visibles para los miembros de la `household`, manteniendo la informacion de quien es el propietario.

Objetivo inicial:

- Registrar aportaciones.
- Registrar compras y ventas.
- Consultar el capital invertido.
- Consultar la distribucion por activo.
- Diferenciar inversiones de gastos e ingresos diarios.

Tipos de activo recomendados:

- Crypto
- Fondo indexado
- ETF
- Accion
- Otro

Campos recomendados para activos:

- Nombre del activo
- Simbolo o ticker opcional
- Tipo de activo
- Plataforma o cuenta de inversion
- Moneda base, inicialmente EUR
- Estado: activo o archivado

Campos recomendados para movimientos de inversion:

- Tipo: compra, venta, aportacion, retirada, dividendo o ajuste
- Activo asociado, si aplica
- Importe en EUR
- Cantidad de unidades, si aplica
- Precio por unidad, si aplica
- Fecha
- Comisiones, si aplica
- Notas

## Mobile First

La interfaz debe disenarse primero para movil.

Prioridades:

- Registro rapido de gasto o ingreso.
- Navegacion inferior o patrones naturales de movil.
- Dashboard resumido y escaneable.
- Formularios cortos.
- Botones tactiles con tamano suficiente.
- Buen rendimiento en conexiones moviles.
- Arquitectura compatible con una posible PWA futura, sin implementarla en las primeras versiones.

Vistas iniciales recomendadas:

- Dashboard
- Nuevo movimiento
- Movimientos
- Presupuestos
- Inversiones
- Cuentas
- Ajustes

## PWA

La aplicacion no se implementara como PWA en las primeras versiones.

La PWA queda como mejora futura no prioritaria. Podria aportar:

- Instalacion en movil.
- Mejor experiencia de uso recurrente.
- Carga mas rapida.
- Posibilidad futura de soporte offline parcial.

El soporte offline completo no forma parte del alcance inicial.

## Roadmap sugerido

### Version 1

- Login con Google.
- Creacion de perfil.
- Creacion o asignacion a household.
- CRUD de cuentas.
- CRUD de categorias.
- Registro de gastos e ingresos.
- Listado y filtros de movimientos.
- Dashboard mensual basico.
- Seguridad RLS en Supabase.
- Diseno mobile first.

### Version 2

- Presupuestos mensuales.
- Movimientos recurrentes.
- Vista compartida con pareja.
- Estadisticas por categoria.

### Version 3

- Registro de inversiones compartidas e individuales visibles en la household.
- Distribucion por tipo de activo.
- Seguimiento de aportaciones.
- Adjuntos para tickets o facturas.
- Exportacion CSV.

### Futuro no prioritario

- PWA instalable.
- Importaciones bancarias.

## Decisiones cerradas

- Angular 21 es la version del framework frontend.
- Tailwind CSS sera el sistema de estilos principal.
- Las categorias tendran opciones por defecto y categorias personalizadas compartidas por household.
- Las inversiones podran ser compartidas por la household o individuales de un usuario.
- Las inversiones individuales seran visibles para los miembros de la household.
- La PWA no forma parte de las primeras versiones y queda como mejora futura.
- No habra importaciones bancarias en el alcance inicial.

## Notas para agentes

- No implementar funcionalidad no solicitada.
- Mantener el enfoque mobile first en cualquier cambio de UI.
- Proteger datos financieros con RLS y reglas basadas en pertenencia a `household`.
- No confiar en el frontend como frontera de seguridad.
- Respetar EUR como unica moneda inicial.
- Separar inversiones de gastos e ingresos diarios.
- Leer `STACK.md` para conocer el stack tecnico vigente del proyecto.
- Mantener `STACK.md` limitado al stack tecnico.
- Cuando se cree una nueva interfaz se debe de introducir dentro de la carpeta `models`.
- Cuando se cree un nuevo servicio Angular se debe ubicar dentro de `src/app/core/services`.
- Los servicios deben agruparse en una subcarpeta por dominio dentro de `core/services`, por ejemplo `core/services/transaction`.
- Al crear o modificar componentes se deben reutilizar los componentes genericos disponibles en `src/app/shared/ui` antes de crear marcado o estilos propios.
- Para botones se deben usar los componentes de `src/app/shared/ui/buttons`, cuando encajen con la interaccion requerida.
