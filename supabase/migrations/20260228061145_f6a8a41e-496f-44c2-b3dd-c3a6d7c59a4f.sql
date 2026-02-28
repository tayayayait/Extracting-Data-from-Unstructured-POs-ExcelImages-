
-- 업체 관리 테이블
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  contact TEXT,
  phone TEXT,
  doc_prefix TEXT NOT NULL DEFAULT '',
  save_path TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  exception_keywords TEXT[] DEFAULT '{}',
  ocr_settings JSONB DEFAULT '{}',
  generation_rules JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 단가 테이블
CREATE TABLE public.unit_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  item_code TEXT,
  unit TEXT DEFAULT 'EA',
  price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 매핑 규칙 테이블
CREATE TABLE public.mapping_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  mappings JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 처리 로그 테이블
CREATE TABLE public.processing_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  execution_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  success_count INT NOT NULL DEFAULT 0,
  fail_count INT NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  details JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 설정 테이블
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  input_path TEXT DEFAULT '/input/orders/',
  output_path TEXT DEFAULT '/output/',
  ocr_api_key TEXT DEFAULT '',
  reduce_motion BOOLEAN DEFAULT false,
  extra JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mapping_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- vendors RLS
CREATE POLICY "Users manage own vendors" ON public.vendors FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- unit_prices RLS
CREATE POLICY "Users manage own unit_prices" ON public.unit_prices FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- mapping_rules RLS
CREATE POLICY "Users manage own mapping_rules" ON public.mapping_rules FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- processing_logs RLS
CREATE POLICY "Users manage own processing_logs" ON public.processing_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- settings RLS
CREATE POLICY "Users manage own settings" ON public.settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at 트리거 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 트리거 적용
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_unit_prices_updated_at BEFORE UPDATE ON public.unit_prices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mapping_rules_updated_at BEFORE UPDATE ON public.mapping_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
