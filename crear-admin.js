// Script para crear usuario administrador en Supabase
// Ejecutar con: node crear-admin.js

const { createClient } = require('@supabase/supabase-js')

// Configuración
const supabaseUrl = 'https://auhyzrwpndzoovfnzzah.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('❌ ERROR: Falta la variable SUPABASE_SERVICE_ROLE_KEY')
  console.log('')
  console.log('📋 PASOS:')
  console.log('1. Ve a: https://supabase.com/dashboard/project/auhyzrwpndzoovfnzzah/settings/api')
  console.log('2. Copia el "service_role" secret (NO el anon key)')
  console.log('3. Ejecuta: export SUPABASE_SERVICE_ROLE_KEY="tu_clave_aqui"')
  console.log('4. Ejecuta: node crear-admin.js')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function crearAdmin() {
  try {
    console.log('🚀 Creando usuario administrador...')

    // 1. Crear usuario en Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'servicioalcliente@viajemoz.com',
      password: 'Vi@j3M0sSecure#1',
      email_confirm: true,
    })

    if (authError) {
      console.error('❌ Error:', authError.message)
      return
    }

    console.log('✅ Usuario creado en Auth:', authUser.user.id)

    // 2. Crear registro en tabla admins
    const { error: adminError } = await supabase.from('admins').insert({
      id: authUser.user.id,
      nombre: 'Servicio al Cliente',
      apellido: 'ViajeMoz',
      email: 'servicioalcliente@viajemoz.com',
      telefono: '8091234567',
      cargo: 'Administrador',
      departamento: 'Servicio al Cliente',
      activo: true,
    })

    if (adminError) {
      console.error('❌ Error creando admin:', adminError.message)
      return
    }

    // 3. Asignar rol de admin
    const { error: roleError } = await supabase.from('user_roles').insert({
      user_id: authUser.user.id,
      role: 'admin',
    })

    if (roleError) {
      console.error('❌ Error asignando rol:', roleError.message)
      return
    }

    console.log('✅ Perfil de administrador creado')
    console.log('')
    console.log('🎉 ¡Usuario listo!')
    console.log('📧 Email: servicioalcliente@viajemoz.com')
    console.log('🔑 Password: Vi@j3M0sSecure#1')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

crearAdmin()
