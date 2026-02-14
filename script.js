// =============================================
// VARIABLES GLOBALES
// =============================================
let memoriales = [];

// =============================================
// FUNCIONES PARA NETLIFY BLOBS
// =============================================

// Cargar todos los memoriales desde la nube
async function cargarMemoriales() {
  try {
    const response = await fetch('/.netlify/functions/getMemorials');
    const data = await response.json();
    memoriales = data;
    return data;
  } catch (error) {
    console.error('Error cargando memoriales:', error);
    return [];
  }
}

// =============================================
// BUSCADOR
// =============================================
async function buscarPersona() {
  const texto = document.getElementById('busqueda').value.toLowerCase();
  const resultadosDiv = document.getElementById('resultados-busqueda');
  
  if (!resultadosDiv) return;
  
  if (texto.length < 2) {
    resultadosDiv.innerHTML = '<p class="resultado-item">Escribe al menos 2 caracteres</p>';
    return;
  }
  
  await cargarMemoriales();
  
  const resultados = memoriales.filter(m => 
    m.nombre.toLowerCase().includes(texto)
  );
  
  if (resultados.length === 0) {
    resultadosDiv.innerHTML = `
      <div class="resultado-item">
        <p>No encontramos a "${texto}"</p>
        <a href="crear.html" style="color: #2c4a5e; text-decoration: none;">¿Quieres crear su memorial?</a>
      </div>
    `;
  } else {
    resultadosDiv.innerHTML = resultados.map(m => `
      <div class="resultado-item" onclick="verTumba(${m.id})" style="cursor: pointer;">
        <h3>${m.nombre}</h3>
        <p>${m.fecha_nac ? m.fecha_nac.split('-')[0] : '?'} - ${m.fecha_def ? m.fecha_def.split('-')[0] : '?'}</p>
        <p>🌸 ${m.flores.length} flores</p>
      </div>
    `).join('');
  }
}

// =============================================
// INICIALIZACIÓN
// =============================================
document.addEventListener('DOMContentLoaded', async function() {
  await cargarMemoriales();
  
  // Configurar buscador
  const inputBusqueda = document.getElementById('busqueda');
  if (inputBusqueda) {
    inputBusqueda.addEventListener('keyup', function(e) {
      if (this.value.length >= 2) {
        buscarPersona();
      }
    });
    
    inputBusqueda.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        buscarPersona();
      }
    });
  }
  
  // Cargar tumba si estamos en tumba.html
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  if (id && window.location.pathname.includes('tumba.html')) {
    cargarTumba(id);
  }
  
  // Configurar formulario si estamos en crear.html
  const formCrear = document.getElementById('form-crear');
  if (formCrear) {
    formCrear.addEventListener('submit', guardarPersona);
  }
});

function verTumba(id) {
  window.location.href = `tumba.html?id=${id}`;
}

// =============================================
// CARGAR TUMBA ESPECÍFICA
// =============================================
async function cargarTumba(id) {
  try {
    const response = await fetch(`/.netlify/functions/getMemorial?id=${id}`);
    const persona = await response.json();
    
    if (!persona) {
      window.location.href = 'index.html';
      return;
    }
    
    window.personaActual = persona;
    
    // Actualizar UI
    document.getElementById('nombre-display').textContent = persona.nombre;
    document.getElementById('fechas-display').textContent = 
      `${persona.fecha_nac || '?'} - ${persona.fecha_def || '?'}`;
    document.getElementById('epitafio-display').textContent = 
      persona.epitafio || '"En memoria"';
    document.getElementById('biografia-display').textContent = 
      persona.biografia || 'No hay biografía disponible';
    
    document.getElementById('flores-contador').textContent = persona.flores.length;
    
    const floresContainer = document.getElementById('flores-container');
    if (floresContainer) {
      floresContainer.innerHTML = persona.flores.map(f => 
        `<span class="flor-item" title="${f.fecha}">${f.tipo}</span>`
      ).join('');
    }
    
    dibujarTumba(persona);
    
  } catch (error) {
    console.error('Error cargando tumba:', error);
    window.location.href = 'index.html';
  }
}

// =============================================
// DIBUJAR TUMBA (TU CÓDIGO ACTUAL - MODIFICADO)
// =============================================
function dibujarTumba(persona) {
  const canvas = document.getElementById('tumbaCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const tumbaX = 100;
  const tumbaY = 200;
  const tumbaAncho = 300;
  const tumbaAlto = 350;
  
  // Césped
  ctx.fillStyle = '#2d5a27';
  ctx.fillRect(0, 500, canvas.width, 100);
  
  // SOMBRA SOLO PARA LA TUMBA (no para el texto)
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;
  
  // Rectángulo de la tumba
  ctx.fillStyle = '#515151';
  ctx.beginPath();
  ctx.rect(tumbaX, tumbaY, tumbaAncho, tumbaAlto);
  ctx.fill();
  
  ctx.strokeStyle = '#4a4a4a';
  ctx.lineWidth = 3;
  ctx.strokeRect(tumbaX, tumbaY, tumbaAncho, tumbaAlto);
  
  // Marco para foto
  ctx.fillStyle = '#D3D3D3';
  const fotoX = tumbaX + tumbaAncho / 2;
  const fotoY = tumbaY + 80;
  
  ctx.beginPath();
  ctx.arc(fotoX, fotoY, 45, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = '#ffb700';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(fotoX, fotoY, 45, 0, Math.PI * 2);
  ctx.stroke();
  
  // Foto
  if (persona.foto) {
    try {
      const img = new Image();
      img.onload = function() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(fotoX, fotoY, 40, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, fotoX - 40, fotoY - 40, 80, 80);
        ctx.restore();
      }
      img.src = persona.foto;
    } catch (e) {
      ctx.fillStyle = '#C0C0C0';
      ctx.beginPath();
      ctx.arc(fotoX, fotoY, 40, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.arc(fotoX, fotoY, 40, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // =============================================
  // TEXTO - SIN SOMBRAS
  // =============================================
  // IMPORTANTE: Desactivar sombras para todo el texto
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowColor = 'transparent';
  
  ctx.textAlign = 'center';
  
  // NOMBRE PRINCIPAL - Dorado y GRANDE
  ctx.fillStyle = '#ffde70';  // Dorado
  ctx.font = 'bold 64px "Times New Roman", serif';  // Más grande
  let nombreMostrar = persona.nombre;
  if (persona.nombre.length > 20) {
    nombreMostrar = persona.nombre.substring(0, 18) + '...';
  }
  ctx.fillText(nombreMostrar, fotoX, tumbaY + 180);
  
  // Fechas - Sin sombra
  ctx.font = '42px "Times New Roman", serif';
  ctx.fillStyle = '#ffffff';  // Plateado
  const añoNac = persona.fecha_nac ? persona.fecha_nac.split('-')[0] : '?';
  const añoDef = persona.fecha_def ? persona.fecha_def.split('-')[0] : '?';
  ctx.fillText(`${añoNac} - ${añoDef}`, fotoX, tumbaY + 275);
  
  // Epitafio - Sin sombra
  ctx.font = 'italic 32px "Times New Roman", serif';
  ctx.fillStyle = '#FFFFFF';  // Blanco
  let epitafio = persona.epitafio || 'En memoria';
  if (epitafio.length > 25) {
    epitafio = epitafio.substring(0, 23) + '...';
  }
  ctx.fillText(`"${epitafio}"`, fotoX, tumbaY + 310);
  
  // Resetear sombras por si acaso
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

// =============================================
// DEJAR FLOR (AHORA GUARDA EN LA NUBE)
// =============================================
async function dejarFlor() {
  if (!window.personaActual) return;
  
  const tiposFlores = ['🌹', '🌻', '🌸', '🌺', '🌼', '🌷'];
  const flor = {
    fecha: new Date().toLocaleDateString('es-ES'),
    tipo: tiposFlores[Math.floor(Math.random() * tiposFlores.length)]
  };
  
  try {
    const response = await fetch('/.netlify/functions/addFlor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: window.personaActual.id,
        flor
      })
    });
    
    const personaActualizada = await response.json();
    window.personaActual = personaActualizada;
    
    // Actualizar UI
    document.getElementById('flores-contador').textContent = personaActualizada.flores.length;
    
    const floresContainer = document.getElementById('flores-container');
    const florElement = document.createElement('span');
    florElement.className = 'flor-item';
    florElement.textContent = flor.tipo;
    florElement.title = flor.fecha;
    floresContainer.appendChild(florElement);
    
    animarFlor();
    
  } catch (error) {
    console.error('Error al dejar flor:', error);
    alert('Error al dejar flor. Intenta de nuevo.');
  }
}

function animarFlor() {
  const canvas = document.getElementById('tumbaCanvas');
  if (!canvas || !window.personaActual) return;
  
  const ctx = canvas.getContext('2d');
  let paso = 0;
  
  function caer() {
    if (paso < 50) {
      dibujarTumba(window.personaActual);
      
      ctx.fillStyle = '#FF69B4';
      ctx.beginPath();
      ctx.arc(250 + Math.sin(paso) * 20, 200 + paso * 5, 10, 0, Math.PI * 2);
      ctx.fill();
      
      paso++;
      requestAnimationFrame(caer);
    } else {
      setTimeout(() => {
        dibujarTumba(window.personaActual);
        
        ctx.fillStyle = '#FF1493';
        ctx.beginPath();
        ctx.arc(250, 550, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(245, 545, 5, 0, Math.PI * 2);
        ctx.arc(255, 545, 5, 0, Math.PI * 2);
        ctx.fill();
      }, 100);
    }
  }
  
  caer();
}

// =============================================
// GUARDAR NUEVA PERSONA (EN LA NUBE)
// =============================================
function guardarPersona(event) {
  event.preventDefault();
  
  const nombre = document.getElementById('nombre').value;
  if (!nombre) {
    alert('El nombre es obligatorio');
    return;
  }
  
  const fecha_nac = document.getElementById('fecha_nac').value;
  const fecha_def = document.getElementById('fecha_def').value;
  const epitafio = document.getElementById('epitafio').value;
  const biografia = document.getElementById('biografia').value;
  const fotoInput = document.getElementById('foto');
  
  if (fotoInput.files && fotoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      crearMemorialEnNube(nombre, fecha_nac, fecha_def, epitafio, biografia, e.target.result);
    };
    reader.readAsDataURL(fotoInput.files[0]);
  } else {
    crearMemorialEnNube(nombre, fecha_nac, fecha_def, epitafio, biografia, null);
  }
}

async function crearMemorialEnNube(nombre, fecha_nac, fecha_def, epitafio, biografia, fotoUrl) {
  try {
    const response = await fetch('/.netlify/functions/createMemorial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre,
        fecha_nac,
        fecha_def,
        epitafio,
        biografia,
        foto: fotoUrl
      })
    });
    
    const memorial = await response.json();
    alert('¡Memorial creado con éxito!');
    window.location.href = `tumba.html?id=${memorial.id}`;
  } catch (error) {
    console.error('Error al crear memorial:', error);
    alert('Error al crear memorial. Intenta de nuevo.');
  }
}