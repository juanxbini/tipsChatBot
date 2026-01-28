# 🚀 Guía de Despliegue - Bot de Propinas

## 📋 **Requisitos Previos**

### **1. Cuenta en MongoDB Atlas**
- [Registrarse en MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
- Crear cluster gratuito (M0)
- Obtener connection string

### **2. Cuenta en Railway**
- [Registrarse en Railway](https://railway.app/)
- Conectar con GitHub

### **3. Bot de Telegram**
- Token del bot (ya lo tienes)
- Chat ID autorizado (ya lo tienes)

---

## 🗄️ **Configurar MongoDB Atlas**

### **1. Crear Cluster**
1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Crea un nuevo proyecto
3. Crea un cluster gratuito (M0)
4. Espera a que se cree (2-5 minutos)

### **2. Configurar Acceso**
1. **Database Access**: Crea un usuario
   - Username: `propinas_bot`
   - Password: Genera una segura
2. **Network Access**: Añade IP `0.0.0.0/0` (acceso desde cualquier lugar)

### **3. Obtener Connection String**
1. Ve a **Database** → **Connect**
2. Elige **Connect your application**
3. Copia el connection string:
```
mongodb+srv://propinas_bot:PASSWORD@cluster.mongodb.net/propinas
```

---

## 🚀 **Despliegue en Railway**

### **1. Subir a GitHub**
```bash
git init
git add .
git commit -m "Bot de propinas listo para producción"
git branch -M main
git remote add origin https://github.com/TU_USERNAME/propinas-bot.git
git push -u origin main
```

### **2. Desplegar en Railway**
1. Ve a [Railway](https://railway.app/)
2. Click **Deploy from GitHub repo**
3. Selecciona tu repositorio
4. Railway detectará automáticamente que es un proyecto Node.js

### **3. Configurar Variables de Entorno**
En Railway, ve a **Settings** → **Variables** y añade:

```env
PORT=3000
MONGO_URI=mongodb+srv://propinas_bot:TU_PASSWORD@cluster.mongodb.net/propinas
BOT_TOKEN=8338637117:AAGmKGSLKxjzeXOqCQgYrbl08cAUXemxBpI
CHAT_ID=6791276769
CRON_HOUR=23
NODE_ENV=production
```

### **4. Configurar Webhook**
Una vez desplegado, obtén la URL de Railway (ej: `https://propinas-bot.up.railway.app`)

Configura el webhook:
```bash
curl -X POST https://api.telegram.org/bot8338637117:AAGmKGSLKxjzeXOqCQgYrbl08cAUXemxBpI/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://TU_URL.up.railway.app/webhook/telegram"}'
```

---

## 🔧 **Alternativa: Render**

### **1. Crear Web Service**
1. Ve a [Render](https://render.com/)
2. Click **New** → **Web Service**
3. Conecta tu repositorio de GitHub

### **2. Configurar**
- **Name**: `propinas-bot`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### **3. Variables de Entorno**
Añade las mismas variables que en Railway

### **4. Configurar Webhook**
```bash
curl -X POST https://api.telegram.org/bot8338637117:AAGmKGSLKxjzeXOqCQgYrbl08cAUXemxBpI/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://TU_URL.onrender.com/webhook/telegram"}'
```

---

## ✅ **Verificación del Despliegue**

### **1. Health Check**
Visita `https://TU_URL/` - debería mostrar mensaje de bienvenida

### **2. Webhook Info**
```bash
curl https://api.telegram.org/bot8338637117:AAGmKGSLKxjzeXOqCQgYrbl08cAUXemxBpI/getWebhookInfo
```

### **3. Probar el Bot**
Envía un mensaje al bot: `hoy 500`

---

## 🛠️ **Troubleshooting**

### **Error: Connection Refused**
- Verifica que el servidor esté corriendo
- Revisa las variables de entorno

### **Error: MongoDB Connection**
- Verifica el connection string
- Asegúrate que el usuario tiene permisos
- Revisa las IPs permitidas en Network Access

### **Error: Webhook Not Working**
- Verifica la URL del webhook
- Asegúrate que usa HTTPS
- Revisa el token del bot

### **Error: Cron Jobs**
- Los servicios gratuitos pueden tener limitaciones
- Railway: Los cron jobs funcionan bien
- Render: Puede requerir plan pago para cron jobs

---

## 📊 **Monitoreo**

### **Logs en Railway**
Ve a tu proyecto → **Logs** para ver actividad en tiempo real

### **Logs en Render**
Ve a tu servicio → **Logs**

### **Métricas de MongoDB**
Ve a MongoDB Atlas → **Metrics** para ver rendimiento

---

## 💡 **Tips de Producción**

### **1. Seguridad**
- Nunca commitees el `.env`
- Usa variables de entorno siempre
- Mantén tu token de bot seguro

### **2. Rendimiento**
- El bot con REGEX es muy ligero
- MongoDB Atlas M0 es suficiente para empezar
- Monitoriza el uso de recursos

### **3. Backups**
- MongoDB Atlas tiene backups automáticos
- Considera exportar datos periódicamente

---

## 🎉 **¡Listo!**

Una vez completados estos pasos, tu bot estará funcionando 24/7 en la nube.

**Costos estimados:**
- MongoDB Atlas: Gratis (M0)
- Railway: Gratis (hasta 500hrs/mes)
- Total: $0/mes para empezar

**Para escalar:**
- Railway Pro: $20/mes
- MongoDB Atlas M10: $25/mes
