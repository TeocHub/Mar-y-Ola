// Reemplaza con tus propias credenciales
const API_KEY = 'AIzaSyDcDTJGYTMYyGdvR-8-UZXIrKdJYj4p3Sw';
const CLIENT_ID = '139919704286-9fh4b033olnbgap2l0mn3tojjqv44q8j.apps.googleusercontent.com';
const SPREADSHEET_ID = '1okGqKC8Qe8NE4_TTSC13T_xxxIHK8KghtAx4Kt4I9r0'; // El ID se encuentra en la URL de tu Google Sheet
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Define los alcances de autorización
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets'; // Permite leer, editar, crear y eliminar hojas de cálculo
// Si solo quieres leer, usa: const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';


// Inicializa la biblioteca de cliente
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

// Inicializa el cliente de la API
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        // Escucha los cambios de estado de autenticación
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        
        // Maneja el estado de autenticación inicial
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }, function(error) {
        console.error('Error al inicializar gapi.client:', error);
    });
}

// Actualiza la interfaz de usuario cuando cambia el estado de autenticación
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        // El usuario está autenticado, puedes cargar el inventario
        cargarInventario();
    } else {
        // El usuario no está autenticado, muestra un botón para iniciar sesión
        console.log('El usuario no está autenticado. Requiere inicio de sesión.');
        // Aquí podrías mostrar un botón de 'Iniciar sesión con Google'
    }
}

// Inicia el proceso de autenticación del usuario
function handleAuthClick() {
    gapi.auth2.getAuthInstance().signIn();
}

// Carga los datos del inventario desde Google Sheets
async function cargarInventario() {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Inventario - Mar y Ola!A:F', // Reemplaza con el nombre de tu hoja y el rango de datos
        });
        
        const data = response.result.values;
        // La primera fila son los encabezados
        const headers = data.shift(); 
        const inventario = data.map(row => {
            let obj = {};
            headers.forEach((header, i) => {
                obj[header] = row[i];
            });
            return obj;
        });
        
        // Ahora puedes usar el array 'inventario' en tus funciones 'renderizarVentas' y 'renderizarInventario'
        // Por ejemplo:
        // renderizarVentas(inventario);
        // renderizarInventario(inventario);

    } catch (error) {
        console.error('Error al cargar el inventario:', error);
    }
}

// Función para actualizar el stock en Google Sheets
async function actualizarStock(ventas) {
    // Aquí se necesita un código más complejo para encontrar las filas correctas y actualizar el stock
    // Por simplicidad, se muestra un ejemplo de cómo se haría
    // Esto es solo un ejemplo, necesitarías adaptar tu lógica aquí.
    
    // Suponiendo que 'ventas' es un array de objetos con 'forma', 'aroma' y 'cantidad'
    for (const venta of ventas) {
        // Primero, busca la fila del producto
        const inventarioResponse = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Inventario - Mar y Ola!A:F',
        });
        const inventarioData = inventarioResponse.result.values;
        const headers = inventarioData.shift();
        
        const rowIndex = inventarioData.findIndex(row => 
            row[headers.indexOf('Forma')] === venta.forma && 
            row[headers.indexOf('Aroma')] === venta.aroma
        );
        
        if (rowIndex !== -1) {
            const rowNumber = rowIndex + 2; // +1 por los encabezados y +1 por el índice base 0
            const stockColumnIndex = headers.indexOf('Quedan');
            const currentStock = parseInt(inventarioData[rowIndex][stockColumnIndex]);
            const newStock = currentStock - venta.cantidad;
            
            const range = `Inventario - Mar y Ola!${String.fromCharCode(65 + stockColumnIndex)}${rowNumber}`;
            
            const valueInputOption = 'RAW';
            const values = [[newStock]];
            const body = { values };
            
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: range,
                valueInputOption: valueInputOption,
                resource: body,
            });
        }
    }
}