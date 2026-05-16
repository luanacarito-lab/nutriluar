/**
 * Utilitários para lidar com datas no fuso horário do Brasil (UTC-3)
 * Evita problemas de conversão automática para UTC que causam o erro de "um dia antes"
 */

/**
 * Retorna a data atual no formato YYYY-MM-DD respeitando o fuso local
 */
export const getTodayString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formata uma string de data (YYYY-MM-DD ou ISO) para o padrão brasileiro DD/MM/YYYY
 * sem o erro de fuso horário.
 */
export const formatLocalDate = (dateStr: string | null | undefined, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateStr) return '-';

  try {
    // Se for apenas data (YYYY-MM-DD), extraímos os componentes para evitar UTC offset
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-');
      
      if (!options) {
        return `${day}/${month}/${year}`;
      }
      
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('pt-BR', options);
    }

    // Para outros formatos (como created_at do Supabase), usamos o parse padrão
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', options);
  } catch (e) {
    console.error('Erro ao formatar data:', e);
    return '-';
  }
};

/**
 * Converte uma string de data YYYY-MM-DD para um objeto Date local
 */
export const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Calcula a idade a partir de uma data de nascimento string (YYYY-MM-DD)
 */
export const calculateAge = (birthDateStr: string): number | null => {
  if (!birthDateStr) return null;
  
  const birthDate = parseLocalDate(birthDateStr);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};
