# Bot Conversacional de Propinas

Bot conversacional inteligente para Telegram que permite registrar y consultar propinas diarias usando lenguaje natural.

## 🎯 Características

- ✅ **Registro de propinas diarias** con lenguaje natural
- ✅ **Marcado de días no trabajados**
- ✅ **Carga múltiple** de días en un solo mensaje
- ✅ **Consultas de totales y promedios**
- ✅ **Recordatorios automáticos** diarios
- ✅ **Interpretación con IA** (OpenAI)
- ✅ **Persistencia en MongoDB**

## 🛠️ Stack Tecnológico

- **Backend**: Node.js + Express
- **Base de Datos**: MongoDB + Mongoose
- **IA**: Google Gemini 1.5 Flash
- **Mensajería**: Telegram Bot API
- **Scheduler**: node-cron

## 📋 Instalación

### 1. Clonar y dependencias

```bash
git clone <repository-url>
cd propinas-bot
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/propinas
BOT_TOKEN=tu_bot_token_aqui
CHAT_ID=tu_chat_id_aqui
CRON_HOUR=22
GEMINI_API_KEY=tu_gemini_token_aqui
```

### 3. Obtener Token de Google Gemini

1. Ve a https://aistudio.google.com/app/apikey
2. Inicia sesión con tu cuenta de Google
3. Click en "Create API Key"
4. Copia la API key generada (empieza con AIza...)
5. Pégala en tu archivo .env

### 4. Crear Bot de Telegram

1. Habla con [@BotFather](https://t.me/botfather) en Telegram
2. Usa `/newbot` para crear un nuevo bot
3. Copia el token que te proporciona
4. Obtén tu Chat ID (habla con [@userinfobot](https://t.me/userinfobot))

### 5. Iniciar MongoDB

Asegúrate de tener MongoDB corriendo localmente o configura la URI en `.env`

### 6. Ejecutar el bot

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🌐 Configurar Webhook

El bot necesita un webhook público para recibir mensajes de Telegram:

```bash
# Configurar webhook (reemplaza con tu URL pública)
curl -X POST http://localhost:3000/admin/webhook/setup \
  -H "Content-Type: application/json" \
  -d '{"webhookUrl": "https://criminological-vilma-unfeasibly.ngrok-free.dev/webhook/telegram"}'
```

O usa ngrok para desarrollo:

```bash
ngrok http 3000
# Usa la URL de ngrok para configurar el webhook
```

## 💬 Comandos del Bot

### Registro de Propinas
- `hoy hice 500` - Registra propina de hoy
- `ayer 300` - Registra propina de ayer
- `2024-01-15 450` - Registra propina de fecha específica

### Múltiples Días
- `lunes 300, martes 450, miércoles 200` - Registra varios días

### Marcar No Trabajado
- `hoy no trabajé` - Marca hoy como no trabajado
- `ayer no trabajé` - Marca ayer como no trabajado

### Consultas
- `hoy` - Muestra registro de hoy
- `resumen` o `resumen del mes` - Muestra resumen mensual
- `promedio` - Muestra promedio diario
- `días no trabajados` - Lista días no trabajados

### Actualizar
- `actualizar hoy 600` - Modifica propina de hoy

### Ayuda
- `ayuda` - Muestra todos los comandos disponibles

## 🏗️ Estructura del Proyecto

```
propinas-bot/
├─ src/
│  ├─ domain/
│  │  ├─ entities/          # Entidades de dominio
│  │  └─ repositories/       # Repositorios de datos
│  ├─ application/
│  │  ├─ intents/           # Router de intenciones
│  │  ├─ services/          # Servicios de aplicación
│  │  └─ usecases/          # Casos de uso
│  ├─ infrastructure/       # Configuración externa
│  ├─ app.js               # Configuración de Express
│  └─ server.js            # Punto de entrada
├─ .env.example            # Variables de entorno
├─ package.json            # Dependencias
└─ README.md              # Documentación
```

## 🔧 Endpoints de API

### Webhook
- `POST /webhook/telegram` - Recibe actualizaciones de Telegram

### Administración
- `GET /` - Health check básico
- `GET /health` - Health check detallado
- `POST /admin/webhook/setup` - Configurar webhook
- `POST /admin/webhook/remove` - Eliminar webhook
- `GET /admin/webhook/info` - Información del webhook

## ⏰ Recordatorios Automáticos

El bot envía un recordatorio diario a la hora configurada (por defecto 22:00):

```
💰 ¿Cuánta propina hiciste hoy?

Si no trabajaste, respondé "no trabajé".
También podés pedir "resumen".
```

## 🧠 Interpretación con IA

El bot usa Google Gemini 1.5 Flash para interpretar mensajes en lenguaje natural y convertirlos en intenciones estructuradas. La IA solo interpreta, la lógica de negocio está completamente separada.

## 🚀 Despliegue

### Docker (Opcional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Variables de Entorno en Producción

Asegúrate de configurar todas las variables de entorno en tu entorno de producción:

- `MONGO_URI` - URI de MongoDB
- `BOT_TOKEN` - Token del bot de Telegram
- `CHAT_ID` - Chat ID autorizado
- `GEMINI_API_KEY` - API Key de Google Gemini
- `CRON_HOUR` - Hora del recordatorio (0-23)
- `PORT` - Puerto del servidor

## 🔒 Seguridad

- El bot solo responde al chat ID configurado
- Validación estricta de intenciones antes de ejecutar
- Manejo seguro de errores sin exponer información sensible
- Las credenciales se cargan desde variables de entorno

## 📝 Logs

La aplicación incluye logging detallado para:
- Conexión a base de datos
- Procesamiento de mensajes
- Errores de IA
- Estado del webhook
- Ejecución de recordatorios

## 📝 Documentación del Código

El proyecto cuenta con documentación detallada en todo el códigobase para facilitar su comprensión y mantenimiento:

### 📁 Estructura de Documentación por Capa

#### **Capa de Infraestructura (`src/infrastructure/`)**
- **`db.js`**: Documentación completa de la gestión de conexión a MongoDB
- **`telegramWebhook.js`**: Explicación detallada del procesamiento de webhooks de Telegram

#### **Capa de Dominio (`src/domain/`)**
- **`entities/Tip.js`**: Documentación del esquema de datos y validaciones
- **`repositories/TipRepository.js`**: Explicación de operaciones CRUD y consultas complejas

#### **Capa de Aplicación (`src/application/`)**
- **`services/aiInterpreter.js`**: Documentación del servicio de IA con OpenAI
- **`services/cron.service.js`**: Explicación de tareas programadas y recordatorios
- **`services/telegram.service.js`**: Documentación de la API de Telegram
- **`intents/`**: Router de intenciones con documentación de flujo
- **`usecases/`**: Casos de uso documentados con parámetros y retornos

#### **Capa de Presentación (`src/`)**
- **`app.js`**: Configuración completa de Express con middleware y rutas
- **`server.js`**: Punto de entrada con manejo de errores

### 📖 Estándares de Documentación

Cada archivo incluye:
- **JSDoc**: Comentarios de función con parámetros y retornos
- **Comentarios en línea**: Explicaciones de lógica compleja
- **Diagramas de flujo**: Descripción de procesos principales
- **Ejemplos de uso**: Casos prácticos de implementación
- **Manejo de errores**: Documentación de casos excepcionales

### 🔍 Navegación del Código

La documentación está organizada por:
1. **Propósito**: Qué hace cada componente
2. **Responsabilidades**: Qué gestiona cada clase
3. **Parámetros**: Qué datos espera cada función
4. **Retornos**: Qué devuelve cada método
5. **Errores**: Qué excepciones puede lanzar

---

## 🤝 Contribuir

1. Fork del proyecto
2. Crear feature branch
3. Commit con cambios descriptivos
4. Push al branch
5. Pull request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles

---

**Bot de Propinas v2.0** - Hecho con ❤️ para facilitar el seguimiento de ingresos diarios
