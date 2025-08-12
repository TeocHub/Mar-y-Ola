document.addEventListener('DOMContentLoaded', () => {
    const URL_DE_TU_SCRIPT = 'https://script.google.com/macros/s/AKfycbyK4jzkwqH-QMWIxB3gW15Duz9VeGCPXm5PnwVqt3vc0M5xTQbqD2i7vJculXSDYX4a/exec'; // REEMPLAZA ESTO CON TU URL

    const btnVentas = document.getElementById('btnVentas');
    const btnInventario = document.getElementById('btnInventario');
    const seccionVentas = document.getElementById('seccionVentas');
    const seccionInventario = document.getElementById('seccionInventario');
    
    btnVentas.addEventListener('click', () => {
        seccionVentas.classList.remove('oculta');
        seccionInventario.classList.add('oculta');
        cargarInventario(); // Recargamos el inventario al cambiar de vista
    });

    btnInventario.addEventListener('click', () => {
        seccionVentas.classList.add('oculta');
        seccionInventario.classList.remove('oculta');
        cargarInventario(); // Recargamos el inventario al cambiar de vista
    });

    const listaProductos = document.querySelector('.lista-productos');
    const listaVenta = document.getElementById('listaVenta');
    const totalVentaSpan = document.getElementById('totalVenta');
    const btnRealizarVenta = document.getElementById('btnRealizarVenta');
    const btnCopiarTexto = document.getElementById('btnCopiarTexto');
    const tablaInventarioBody = document.querySelector('#tablaInventario tbody');

    let inventario = [];
    let carroDeCompra = [];

    // Carga el inventario desde Google Sheets
    async function cargarInventario() {
        try {
            const response = await fetch(URL_DE_TU_SCRIPT);
            if (!response.ok) throw new Error('Error al obtener el inventario.');
            inventario = await response.json();
            renderizarVentas();
            renderizarInventario();
        } catch (error) {
            console.error('Error al cargar el inventario:', error);
            alert('No se pudo cargar el inventario. Revisa la consola para más detalles.');
        }
    }

    // Funciones de la sección de ventas
    // Funciones de la sección de ventas
// Funciones de la sección de ventas
    function renderizarVentas() {
        listaProductos.innerHTML = '';
        inventario.forEach(producto => {
            // Aquí generas un ID único combinando Forma y Aroma
            const productoID = `${producto['Forma/Nombre']}-${producto['Aroma']}`;
            const card = document.createElement('div');
            card.classList.add('producto-card');
            card.innerHTML = `
            <h4>${producto['Forma/Nombre']} - ${producto['Aroma']}</h4>
            <p>Stock: ${producto['Cuantas Quedan']}</p>
            <p>Precio: $${parseFloat(producto['Precio']).toFixed(2)}</p>
            <button onclick="agregarAlCarro('${productoID}')">Agregar</button>
            `;
            listaProductos.appendChild(card);
        });
    }

    window.agregarAlCarro = (productoID) => {
        const [formaNombre, aroma] = productoID.split('-');
        const productoInventario = inventario.find(p => 
            p['Forma/Nombre'] === formaNombre && p['Aroma'] === aroma
        ); 

    if (productoInventario && productoInventario['Cuantas Quedan'] > 0) {
        let productoEnCarro = carroDeCompra.find(p => p.productoID === productoID);
        if (productoEnCarro) {
            productoEnCarro.cantidad++;
        } else {
            carroDeCompra.push({
                productoID: productoID, // Guardamos el ID único
                formaNombre: productoInventario['Forma/Nombre'],
                aroma: productoInventario['Aroma'],
                precio: parseFloat(productoInventario['Precio']),
                cantidad: 1
            });
        }
        productoInventario['Cuantas Quedan']--;
        actualizarCarroVenta();
        renderizarVentas();
    } else {
        alert('Producto sin stock disponible.');
    }
    };

    function actualizarCarroVenta() {
        listaVenta.innerHTML = '';
        let total = 0;
        carroDeCompra.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.cantidad}x ${item.formaNombre} - $${(item.cantidad * item.precio).toFixed(2)}`;
            listaVenta.appendChild(li);
            total += item.cantidad * item.precio;
        });
        totalVentaSpan.textContent = total.toFixed(2);
    }

    btnRealizarVenta.addEventListener('click', async () => {
        if (carroDeCompra.length === 0) {
            alert('El carro está vacío.');
            return;
        }

        try {
            const response = await fetch(URL_DE_TU_SCRIPT, {
                method: 'POST',
                body: JSON.stringify({ ventas: carroDeCompra })
            });
            if (!response.ok) throw new Error('Error al registrar la venta.');

            alert('Venta realizada y stock actualizado en Google Sheets.');
            carroDeCompra = [];
            actualizarCarroVenta();
            await cargarInventario(); // Recargamos el inventario para reflejar los cambios
        } catch (error) {
            console.error('Error durante la venta:', error);
            alert('Ocurrió un error al registrar la venta. Intenta nuevamente.');
        }
    });

    btnCopiarTexto.addEventListener('click', () => {
        if (carroDeCompra.length === 0) {
            alert('El carro está vacío.');
            return;
        }

        let textoResumen = "Resumen de Venta:\n";
        carroDeCompra.forEach(item => {
            textoResumen += `${item.cantidad}x ${item.formaNombre} - $${(item.cantidad * item.precio).toFixed(2)}\n`;
        });
        textoResumen += `\nTotal: $${totalVentaSpan.textContent}`;

        navigator.clipboard.writeText(textoResumen)
            .then(() => alert('Resumen copiado al portapapeles!'))
            .catch(err => console.error('Error al copiar: ', err));
    });

    // Funciones de la sección de inventario
    function renderizarInventario() {
        tablaInventarioBody.innerHTML = '';
        inventario.forEach(producto => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${producto['Tipo de Cera']}</td>
                <td>${producto['Colección']}</td>
                <td>${producto['Forma/Nombre']}</td>
                <td>${producto['Aroma']}</td>
                <td>${producto['Cuantas Quedan']}</td>
                <td>$${parseFloat(producto['Precio']).toFixed(2)}</td>
            `;
            tablaInventarioBody.appendChild(tr);
        });
    }

    // Inicializamos la carga del inventario al cargar la página
    cargarInventario();
});