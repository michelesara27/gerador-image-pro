-- Criação da tabela templates
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    example_image TEXT NOT NULL,
    prompt TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criação da tabela generation_requests
CREATE TABLE IF NOT EXISTS public.generation_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE,
    template_name VARCHAR(255) NOT NULL,
    user_image TEXT NOT NULL,
    prompt TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
    generated_image TEXT,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_templates_updated_at 
    BEFORE UPDATE ON public.templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generation_requests_updated_at 
    BEFORE UPDATE ON public.generation_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_templates_status ON public.templates(status);
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON public.templates(created_at);

CREATE INDEX IF NOT EXISTS idx_generation_requests_template_id ON public.generation_requests(template_id);
CREATE INDEX IF NOT EXISTS idx_generation_requests_status ON public.generation_requests(status);
CREATE INDEX IF NOT EXISTS idx_generation_requests_created_at ON public.generation_requests(created_at);

-- Políticas RLS (Row Level Security) - opcional, para segurança adicional
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_requests ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública dos templates ativos
CREATE POLICY "Templates públicos podem ser lidos" ON public.templates
    FOR SELECT USING (status = 'active');

-- Política para permitir todas as operações nos templates (ajustar conforme necessário)
CREATE POLICY "Operações completas em templates" ON public.templates
    FOR ALL USING (true);

-- Política para permitir todas as operações nas requisições de geração
CREATE POLICY "Operações completas em generation_requests" ON public.generation_requests
    FOR ALL USING (true);

-- Inserir alguns templates padrão
INSERT INTO public.templates (name, description, example_image, prompt, category) VALUES
('Retrato Artístico', 'Transforme sua foto em um retrato artístico elegante', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBDMTI3LjYxNCA1MCA1MCA3Ny4zODU4IDUwIDEwNUM1MCAxMzIuNjE0IDc3LjM4NTggMTYwIDEwMCAxNjBDMTIyLjYxNCAxNjAgMTUwIDEzMi42MTQgMTUwIDEwNUMxNTAgNzcuMzg1OCAxMjIuNjE0IDUwIDEwMCA1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+', 'artistic portrait, elegant style, professional lighting, detailed facial features', 'portrait'),
('Estilo Cyberpunk', 'Dê um visual futurista e cyberpunk à sua imagem', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMUExQTFBIi8+CjxwYXRoIGQ9Ik0xMDAgNTBDMTI3LjYxNCA1MCA1MCA3Ny4zODU4IDUwIDEwNUM1MCAxMzIuNjE0IDc3LjM4NTggMTYwIDEwMCAxNjBDMTIyLjYxNCAxNjAgMTUwIDEzMi42MTQgMTUwIDEwNUMxNTAgNzcuMzg1OCAxMjIuNjE0IDUwIDEwMCA1MFoiIGZpbGw9IiNGRjAwRkYiLz4KPC9zdmc+', 'cyberpunk style, neon lights, futuristic, digital art, synthwave aesthetic', 'futuristic'),
('Aquarela Suave', 'Transforme sua foto em uma pintura em aquarela delicada', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkFGQUZBIi8+CjxwYXRoIGQ9Ik0xMDAgNTBDMTI3LjYxNCA1MCA1MCA3Ny4zODU4IDUwIDEwNUM1MCAxMzIuNjE0IDc3LjM4NTggMTYwIDEwMCAxNjBDMTIyLjYxNCAxNjAgMTUwIDEzMi42MTQgMTUwIDEwNUMxNTAgNzcuMzg1OCAxMjIuNjE0IDUwIDEwMCA1MFoiIGZpbGw9IiM2MkI2RjciLz4KPC9zdmc+', 'watercolor painting, soft colors, artistic brush strokes, delicate style', 'artistic')
ON CONFLICT DO NOTHING;