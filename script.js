document.addEventListener('DOMContentLoaded', () => {
    // Reemplaza con tus propias credenciales
    const API_KEY = 'AIzaSyDcDTJGYTMYyGdvR-8-UZXIrKdJYj4p3Sw';
    const CLIENT_ID = '139919704286-9fh4b033olnbgap2l0mn3tojjqv44q8j.apps.googleusercontent.com';
    const SPREADSHEET_ID = '1okGqKC8Qe8NE4_TTSC13T_xxxIHK8KghtAx4Kt4I9r0'; // El ID se encuentra en la URL de tu Google Sheet
    const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
    const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
    
    // Elementos del DOM
    const btnVentas = document.getElementById('btnVentas');
    const btnInventario = document.getElementById('btnInventario');
    const seccionVentas = document.getElementById('seccionVentas');
    const seccionInventario = document.getElementById('seccionInventario');
    const listaProductos = document.querySelector('.lista-productos');
    const listaVenta = document.getElementById('listaVenta');
    const totalVentaSpan = document.getElementById('totalVenta');
    const btnRealizarVenta = document.getElementById('btnRealizarVenta');
    const btnCopiarTexto = document.getElementById('btnCopiarTexto');
    const tablaInventarioBody = document.querySelector('#tablaInventario tbody');

    let inventario = [];
    let carroDeCompra = [];

    // Lógica para el manejo de la autenticación
    window.handleClientLoad = () => {
        gapi.load('client:auth2', initClient);
    }
    
    function initClient() {
        gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES
        }).then(() => {
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        }, error => {
            console.error('Error al inicializar gapi.client:', error);
            alert('Error al inicializar la API. Revisa la consola para más detalles.');
        });
    }

    function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            console.log('Usuario autenticado. Cargando inventario...');
            cargarInventario();
        } else {
            console.log('Usuario no autenticado. Iniciando sesión...');
            // Inicia el proceso de autenticación automáticamente
            gapi.auth2.getAuthInstance().signIn();
        }
    }

    // Funciones principales
    async function cargarInventario() {
        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Inventario - Mar y Ola!A:F', // Asegúrate de que el rango sea correcto
            });
            
            const data = response.result.values;
            const headers = data.shift();
            inventario = data.map(row => {
                let obj = {};
                headers.forEach((header, i) => {
                    obj[header] = row[i];
                });
                return obj;
            });
            
            renderizarVentas();
            renderizarInventario();

        } catch (error) {
            console.error('Error al cargar el inventario:', error);
            alert('No se pudo cargar el inventario. Asegúrate de haber iniciado sesión y que la API esté configurada correctamente.');
        }
    }

    // Funciones de la sección de ventas
    function renderizarVentas() {
        listaProductos.innerHTML = '';
        inventario.forEach(producto => {
            const productoID = `${producto['Forma']}-${producto['Aroma']}`;
            const card = document.createElement('div');
            card.classList.add('producto-card');
            card.innerHTML = `
                <h4>${producto['Forma']} - ${producto['Aroma']}</h4>
                <p>Stock: ${producto['Quedan']}</p>
                <p>Precio: $${parseFloat(producto['Precio']).toFixed(2)}</p>
                <button onclick="agregarAlCarro('${productoID}')">Agregar</button>
            `;
            listaProductos.appendChild(card);
        });
    }

    window.agregarAlCarro = (productoID) => {
        const [forma, aroma] = productoID.split('-');
        const productoInventario = inventario.find(p => 
            p['Forma'] === forma && p['Aroma'] === aroma
        ); 

        if (productoInventario && productoInventario['Quedan'] > 0) {
            let productoEnCarro = carroDeCompra.find(p => p.productoID === productoID);
            if (productoEnCarro) {
                productoEnCarro.cantidad++;
            } else {
                carroDeCompra.push({
                    productoID: productoID, 
                    forma: productoInventario['Forma'],
                    aroma: productoInventario['Aroma'],
                    precio: parseFloat(productoInventario['Precio']),
                    cantidad: 1
                });
            }
            productoInventario['Quedan']--;
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
            li.textContent = `${item.cantidad}x ${item.forma} - $${(item.cantidad * item.precio).toFixed(2)}`;
            listaVenta.appendChild(li);
            total += item.cantidad * item.precio;
        });
        totalVentaSpan.textContent = total.toFixed(2);
    }
    
    // El resto de tus funciones como btnRealizarVenta y btnCopiarTexto irán aquí
    // Las llamadas a gapi.client.sheets.spreadsheets.values.update() para el POST
    // deben ser implementadas en la función btnRealizarVenta
    
    // Funciones de la sección de inventario
    function renderizarInventario() {
        tablaInventarioBody.innerHTML = '';
        inventario.forEach(producto => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${producto['Tipo de Cera']}</td>
                <td>${producto['Colección']}</td>
                <td>${producto['Forma']}</td>
                <td>${producto['Aroma']}</td>
                <td>${producto['Quedan']}</td>
                <td>$${parseFloat(producto['Precio']).toFixed(2)}</td>
            `;
            tablaInventarioBody.appendChild(tr);
        });
    }
});