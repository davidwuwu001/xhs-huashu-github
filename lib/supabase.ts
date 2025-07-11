import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库类型定义
export interface Module {
  id: string
  name: string
  description?: string  // 添加 description 字段
  parent_id: string | null
  sort_order: number
  created_at: string
}

export interface Script {
  id: string
  title: string
  content: string
  module_id: string | null  // 修改为允许 null
  tags: string[]
  copy_count: number
  created_at: string
  module?: Module
}

export interface Admin {
  id: string
  email: string
  password_hash: string
}

// ModuleService 类型定义
interface ModuleService {
  getModules(): Promise<Module[]>
  createModule(module: Omit<Module, 'id' | 'created_at'>): Promise<Module>
  updateModule(id: string, updates: Partial<Module>): Promise<Module>
  deleteModule(id: string): Promise<void>
}

// ScriptService 类型定义
interface ScriptService {
  getScripts(): Promise<Script[]>
  getScriptsByModule(moduleId: string): Promise<Script[]>
  incrementCopyCount(scriptId: string): Promise<void>
  createScript(script: Omit<Script, 'id' | 'created_at' | 'copy_count' | 'module'>): Promise<Script>
  updateScript(id: string, updates: Partial<Omit<Script, 'id' | 'created_at' | 'copy_count' | 'module'>>): Promise<Script>
  deleteScript(id: string): Promise<void>
}

// 数据库操作函数
export const scriptService: ScriptService = {
  // 获取所有话术
  async getScripts() {
    const { data, error } = await supabase
      .from('scripts')
      .select(`
        *,
        module:modules(*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Script[]
  },

  // 根据模块获取话术
  async getScriptsByModule(moduleId: string) {
    const { data, error } = await supabase
      .from('scripts')
      .select(`
        *,
        module:modules(*)
      `)
      .eq('module_id', moduleId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Script[]
  },

  // 增加复制次数
  async incrementCopyCount(scriptId: string) {
    // 先获取当前的复制次数
    const { data: currentData, error: fetchError } = await supabase
      .from('scripts')
      .select('copy_count')
      .eq('id', scriptId)
      .single()
    
    if (fetchError) throw fetchError
    
    // 更新复制次数
    const { error: updateError } = await supabase
      .from('scripts')
      .update({ copy_count: (currentData.copy_count || 0) + 1 })
      .eq('id', scriptId)
    
    if (updateError) throw updateError
  },

  // 创建话术
  async createScript(script: Omit<Script, 'id' | 'created_at' | 'copy_count'>) {
    const { data, error } = await supabase
      .from('scripts')
      .insert([{ ...script, copy_count: 0 }])
      .select()
      .single()
    
    if (error) throw error
    return data as Script
  },

  // 更新话术
  async updateScript(id: string, updates: Partial<Script>) {
    const { data, error } = await supabase
      .from('scripts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Script
  },

  // 删除话术
  async deleteScript(id: string) {
    const { error } = await supabase
      .from('scripts')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

export const moduleService = {
  // 获取所有模块
  async getModules() {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data as Module[]
  },

  // 创建模块
  async createModule(module: Omit<Module, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('modules')
      .insert([module])
      .select()
      .single()
    
    if (error) throw error
    return data as Module
  },

  // 更新模块
  async updateModule(id: string, updates: Partial<Module>) {
    const { data, error } = await supabase
      .from('modules')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Module
  },

  // 删除模块
  async deleteModule(id: string) {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}