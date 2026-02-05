import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing intake log ID',
    })
  }

  const { status, notes, actual_time } = body

  const updateData: any = {}
  if (status) updateData.status = status
  if (notes !== undefined) updateData.notes = notes
  if (actual_time !== undefined) updateData.actual_time = actual_time

  const { data, error } = await client
    .from('intake_logs')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select(`
      *,
      substance:substances (*)
    `)
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  return data
})
