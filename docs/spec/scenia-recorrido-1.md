# Recorrido 1 · La demo — guion de pruebas

> El camino que verá Dani. Tiene que ser impecable.
> Cifras contrastadas con el seed a fecha de hoy.
>
> **Regla: anota, no arregles.** Si paras a corregir pierdes el hilo y no llegas al final.

---

## Antes de empezar

Limpia el `sessionStorage` del navegador. Si hay una bolsa vieja guardada, verás datos de una versión anterior y no sabrás si el fallo es real.

---

## Paso 1 · Cartera

| Qué debe salir | |
|---|---|
| Nº de clientes | 6 |
| García-Llorente · patrimonio neto | **790.000 €** |
| García-Llorente · escenarios | 6 |
| Total de la cartera | **8.195.000 €** |

**Comprueba:** que ordenar por Patrimonio funcione en los dos sentidos · que el buscador filtre por nombre · que las barras de composición sean distintas entre clientes (si salen todas iguales, la composición no se está calculando).

**Ojo aquí:** Navarro Sanchís ahora es de **Madrid**. Guárdatelo para el paso 8.

Entra en García-Llorente.

---

## Paso 2 · Patrimonio · las siete pestañas

Aterrizas en Resumen. Recórrelas todas y comprueba que los totales cuadran **entre sí**:

| Pestaña | Qué debe sumar |
|---|---|
| Resumen · treemap | Financiero 505.000 · Inmobiliario 420.000 · Otros 45.000 · Empresarial **"no valorada"** |
| Resumen · patrimonio neto | **790.000 €** (970.000 de activos − 180.000 de pasivos) |
| Resumen · capacidad de ahorro | **75.160 €/año** |
| Activos | 970.000 € en total, en cuatro grupos |
| Pasivos | 180.000 € |
| Ingresos | 127.000 € (Carlos 95.000 · Marta 32.000) |
| Gastos | 58.020 € |
| Ahorro | 127.000 − 58.020 + 6.180 = **75.160 €** |

**La comprobación que importa:** que la sociedad diga **"no valorada"** y no "0 €". Un cero se lee como una cifra; "no valorada" dice la verdad.

**Prueba el drill-down:** pincha el bloque financiero del treemap → debe llevarte a Activos. Pincha el nombre del Fondo A → debe abrir su ficha con el reparto 60/40.

---

## Paso 3 · Fiscalidad

| | Carlos | Marta |
|---|---|---|
| Base liquidable | **88.950 €** | **27.920 €** |
| Cuota del ejercicio | **31.210 €** | **5.412 €** |
| Tramo estatal | 22,5 % | 15 % |
| Tramo autonómico | 26,5 % | 15 % |
| Margen hasta el siguiente (autonómico) | **11.050 €** | **4.080 €** |

**Lo que hay que entender de esta pantalla:** la base liquidable de Carlos no son sus 95.000 € de sueldo. Son 95.000 − 4.050 de cotizaciones − 2.000 de gastos = 88.950 €. Si la pantalla enseña 95.000, el cálculo de base liquidable no está llegando aquí.

**Comprueba:** que la base general y la del ahorro estén separadas · que los tramos **no** sean editables · que aparezca "orientativo" en las cifras · que la base del ahorro muestre un hueco explícito (no hay rentas del ahorro modeladas).

---

## Paso 4 · Escenarios · la lista

Debe haber **seis**, con "Situación actual" el primero y marcado como plan base:

| Escenario | Fila fiscal |
|---|---|
| Situación actual | 0 € |
| A · Reembolso | 2.708 € |
| B · Pignoración | 0 € |
| C · Venta Jávea 2033 | 13.255 € |
| D · Venta Jávea 2036 | 0 € |
| E · Rescate capital Marta | 3.855 € |

Abre "Situación actual": debe tener las dos jubilaciones (Carlos 2033, Marta 2036), ambas marcadas como **introducidas por el asesor**, no calculadas.

---

## Paso 5 · Montar un escenario desde cero

**Este es el paso más importante del recorrido.** Los seis de arriba vienen del seed; lo que hay que probar es que el asesor pueda montar el suyo.

1. Clona el plan base.
2. **Renómbralo** "Prueba · rescate jubilado".
3. Añade un evento: rescatar el plan de Carlos, en renta, 15.000 €/año, **en 2035**.

**Qué debe pasar:**
- El menú de eventos debe ofrecerte **cualquier activo**, no solo el que hayas tocado. Si solo te deja el plan, el escenario sigue atado al activo.
- Debe **heredar las dos jubilaciones** del plan base.
- La cuota debe salir alrededor de **5.243 €**, no 7.390 €. La diferencia es que en 2035 Carlos ya está jubilado y su base es la pensión, no el sueldo.

**Si sale 7.390 €, la jubilación no está cambiando los ingresos** — y ese es el argumento central del producto.

---

## Paso 6 · El comparador · las tres comparaciones

**Comparación 1 · A vs B (misma liquidez, distinta vía).**
2.708 € contra 0 €. Reembolsar realiza plusvalía; pignorar usa el fondo como garantía sin venderlo.

**Comparación 2 · C vs D (la mejor demostración).**
13.255 € contra 0 €. La misma venta, tres años después. En 2036 ambos superan los 65 y la vivienda habitual queda exenta.

**Comparación 3 · tu escenario del paso 5 contra el plan base.**

**En todas, comprueba:** tinta neutra sin ganador coronado · nada de verde ni rojo · que **no** diga "cálculo parcial" · que el toggle € hoy / € futuro afecte al **gráfico** (las cifras de hoy menores) y que la fila fiscal no cambie — es la cuota del primer ejercicio en euros de ese año.

---

## Paso 7 · El informe

Pulsa Generar informe e **intenta generarlo sin escribir la Nota**. Debe bloquearte en rojo — el único rojo permitido en el producto.

Escribe una conclusión, genera, y comprueba que aparece en **Historial** con fecha de hoy.

Vuelve a Cartera: "Última revisión" de García-Llorente debería decir **"hoy"**.

---

## Paso 8 · Los avisos

Vuelve a Cartera y entra en **Navarro Sanchís** (Madrid).

En Fiscalidad debe salir: *"El cálculo fiscal solo está disponible para la Comunitat Valenciana."* (y, como es cliente ligero, también el aviso de que solo puebla la Cartera).

En Patrimonio · Resumen: *"Foto ligera · sin detalle cargado"* con el total agregado **1.150.000 €** visible — no un treemap a 0 €.

Comprueba también qué se ve en sus otras pantallas — es un cliente ligero, así que debería explicar que solo puebla la cartera, sin inventar cifras.

---

## Resumen de cifras clave

| Concepto | Valor |
|---|---|
| Patrimonio neto GL | 790.000 € |
| Total cartera | 8.195.000 € |
| Capacidad de ahorro | 75.160 €/año |
| Base liquidable Carlos | 88.950 € |
| Base liquidable Marta | 27.920 € |
| Rescate 15.000 € · 2026 (trabajando) | 7.390 € |
| Rescate 15.000 € · 2035 (jubilado) | 5.243 € |
| Venta Jávea 2033 | 13.255 € |
| Venta Jávea 2036 | 0 € |

---

## Qué anotar

Tres columnas mientras recorres:

**No cuadra** — una cifra distinta de la esperada, un total que no suma, algo que no aparece.

**Chirría** — funciona pero se siente mal: demasiados clics, un orden raro, un texto confuso.

**Falta** — algo que esperabas encontrar y no está.

La tercera columna es la que más vale: es donde salen las diferencias entre lo que el producto hace y lo que un asesor espera que haga.
