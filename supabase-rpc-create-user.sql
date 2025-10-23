-- Función RPC para crear usuario con credenciales desde el cliente
-- Ejecutar en Supabase → SQL Editor

-- Esta función permite crear usuarios en auth.users desde el lado del cliente
-- Solo los admins pueden ejecutarla

CREATE OR REPLACE FUNCTION create_viajero_user(
  user_email TEXT,
  user_password TEXT,
  viajero_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con privilegios del creador de la función
AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Verificar que quien ejecuta es admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Solo administradores pueden crear usuarios';
  END IF;

  -- Crear usuario en auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('viajero_id', viajero_id),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Crear rol de cliente
  INSERT INTO user_roles (user_id, role, viajero_id)
  VALUES (new_user_id, 'cliente', viajero_id);

  -- Retornar resultado
  result := json_build_object(
    'success', true,
    'user_id', new_user_id,
    'message', 'Usuario creado exitosamente'
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- Retornar error
    result := json_build_object(
      'success', false,
      'error', SQLERRM
    );
    RETURN result;
END;
$$;

-- Dar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION create_viajero_user(TEXT, TEXT, UUID) TO authenticated;

-- Comentario
COMMENT ON FUNCTION create_viajero_user IS 'Crea un usuario de viajero con credenciales. Solo ejecutable por admins.';
