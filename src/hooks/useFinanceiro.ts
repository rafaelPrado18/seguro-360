import { useQuery } from "@tanstack/react-query";
import { financeiroService, type FinanceiroClient } from "@/services/financeiroService";

const MOCK_FINANCEIRO: FinanceiroClient[] = [
  {
    id: "mock-1",
    nome: "João Silva",
    apolice: "#4521",
    totalParcelas: 12,
    parcelas: [
      { mes: "Abr/25", status: "pago" }, { mes: "Mai/25", status: "pago" },
      { mes: "Jun/25", status: "pago" }, { mes: "Jul/25", status: "pago" },
      { mes: "Ago/25", status: "pago" }, { mes: "Set/25", status: "pago" },
      { mes: "Out/25", status: "pago" }, { mes: "Nov/25", status: "pago" },
      { mes: "Dez/25", status: "pago" }, { mes: "Jan/26", status: "pago" },
      { mes: "Fev/26", status: "pendente" }, { mes: "Mar/26", status: "pendente" },
    ],
    dadosCliente: {
      cpfCnpj: "123.456.789-00", email: "joao.silva@email.com", telefone: "(11) 3456-7890",
      celular: "(11) 99876-5432", endereco: "Rua das Flores, 123", bairro: "Centro",
      cidade: "São Paulo", uf: "SP", cep: "01001-000",
    },
    dadosApolice: {
      numeroApolice: "4521", numeroProposta: "P-8890", seguradora: "Porto Seguro",
      ramo: "Automóvel", vigenciaInicio: "01/04/2025", vigenciaFim: "01/04/2026",
      premioTotal: "R$ 3.200,00", premioLiquido: "R$ 2.800,00", iof: "R$ 220,00",
      comissao: "20%", formaPagamento: "12x cartão", franquia: "R$ 2.500,00", classeBonus: "5",
      veiculo: {
        fabricante: "Volkswagen", modelo: "Polo 1.0 TSI", ano: "2023",
        placa: "ABC-1D23", chassi: "9BWAA05U5LT000001", combustivel: "Flex", fipe: "R$ 85.000,00",
      },
    },
    historico: [
      { data: "28/03/2026 14:30", tipo: "pagamento", descricao: "Parcela 10 confirmada como paga", autor: "Sistema" },
      { data: "25/03/2026 10:15", tipo: "ligacao", descricao: "Ligação de cobrança realizada", autor: "Ana Paula" },
      { data: "20/03/2026 09:00", tipo: "whatsapp", descricao: "Lembrete de parcela enviado via WhatsApp", autor: "Sistema" },
      { data: "01/04/2025 10:00", tipo: "apolice", descricao: "Apólice #4521 emitida - Porto Seguro Automóvel", autor: "Sistema" },
    ],
  },
  {
    id: "mock-2",
    nome: "Empresa ABC Ltda",
    apolice: "#4520",
    totalParcelas: 12,
    parcelas: [
      { mes: "Jun/25", status: "pago" }, { mes: "Jul/25", status: "pago" },
      { mes: "Ago/25", status: "pago" }, { mes: "Set/25", status: "pago" },
      { mes: "Out/25", status: "pago" }, { mes: "Nov/25", status: "pendente" },
      { mes: "Dez/25", status: "pago" }, { mes: "Jan/26", status: "pago" },
      { mes: "Fev/26", status: "pendente" }, { mes: "Mar/26", status: "pendente" },
      { mes: "Abr/26", status: "pendente" }, { mes: "Mai/26", status: "pendente" },
    ],
    dadosCliente: {
      cpfCnpj: "12.345.678/0001-90", email: "contato@abc.com.br", telefone: "(11) 2222-3333",
      celular: "(11) 98765-4321", endereco: "Av. Paulista, 1000, Sala 501", bairro: "Bela Vista",
      cidade: "São Paulo", uf: "SP", cep: "01310-100",
    },
    dadosApolice: {
      numeroApolice: "4520", numeroProposta: "P-8875", seguradora: "Tokio Marine",
      ramo: "Empresarial", vigenciaInicio: "01/06/2025", vigenciaFim: "01/06/2026",
      premioTotal: "R$ 8.500,00", premioLiquido: "R$ 7.200,00", iof: "R$ 540,00",
      comissao: "15%", formaPagamento: "12x boleto", franquia: "R$ 5.000,00", classeBonus: "-",
    },
    historico: [
      { data: "27/03/2026 16:00", tipo: "email", descricao: "E-mail de cobrança enviado para parcelas em atraso", autor: "Ana Paula" },
      { data: "01/06/2025 10:00", tipo: "apolice", descricao: "Apólice #4520 emitida - Tokio Marine Empresarial", autor: "Sistema" },
    ],
  },
  {
    id: "mock-3",
    nome: "Maria Santos",
    apolice: "#4519",
    totalParcelas: 6,
    parcelas: [
      { mes: "Out/25", status: "pago" }, { mes: "Nov/25", status: "pago" },
      { mes: "Dez/25", status: "pendente" }, { mes: "Jan/26", status: "pendente" },
      { mes: "Fev/26", status: "pendente" }, { mes: "Mar/26", status: "pendente" },
    ],
    dadosCliente: {
      cpfCnpj: "987.654.321-00", email: "maria.santos@email.com", telefone: "(21) 3333-4444",
      celular: "(21) 97654-3210", endereco: "Rua Copacabana, 456", bairro: "Copacabana",
      cidade: "Rio de Janeiro", uf: "RJ", cep: "22050-002",
    },
    dadosApolice: {
      numeroApolice: "4519", numeroProposta: "P-8860", seguradora: "Bradesco Seguros",
      ramo: "Automóvel", vigenciaInicio: "01/10/2025", vigenciaFim: "01/04/2026",
      premioTotal: "R$ 1.800,00", premioLiquido: "R$ 1.550,00", iof: "R$ 120,00",
      comissao: "18%", formaPagamento: "6x cartão", franquia: "R$ 3.000,00", classeBonus: "3",
      veiculo: {
        fabricante: "Honda", modelo: "Civic EXL", ano: "2022",
        placa: "DEF-5G67", chassi: "93HFC6830PZ000002", combustivel: "Flex", fipe: "R$ 130.000,00",
      },
    },
    historico: [
      { data: "26/03/2026 11:00", tipo: "whatsapp", descricao: "Cobrança enviada via WhatsApp", autor: "Ana Paula" },
      { data: "01/10/2025 10:00", tipo: "apolice", descricao: "Apólice #4519 emitida - Bradesco Seguros", autor: "Sistema" },
    ],
  },
  {
    id: "mock-4",
    nome: "Carlos Mendes",
    apolice: "#4518",
    totalParcelas: 12,
    parcelas: [
      { mes: "Abr/25", status: "pago" }, { mes: "Mai/25", status: "pago" },
      { mes: "Jun/25", status: "pago" }, { mes: "Jul/25", status: "pago" },
      { mes: "Ago/25", status: "pago" }, { mes: "Set/25", status: "pago" },
      { mes: "Out/25", status: "pago" }, { mes: "Nov/25", status: "pago" },
      { mes: "Dez/25", status: "pago" }, { mes: "Jan/26", status: "pago" },
      { mes: "Fev/26", status: "pago" }, { mes: "Mar/26", status: "pago" },
    ],
    dadosCliente: {
      cpfCnpj: "456.789.123-00", email: "carlos.mendes@email.com", telefone: "(31) 3555-6666",
      celular: "(31) 96543-2109", endereco: "Rua Savassi, 789", bairro: "Savassi",
      cidade: "Belo Horizonte", uf: "MG", cep: "30130-000",
    },
    dadosApolice: {
      numeroApolice: "4518", numeroProposta: "P-8845", seguradora: "SulAmérica",
      ramo: "Automóvel", vigenciaInicio: "01/04/2025", vigenciaFim: "01/04/2026",
      premioTotal: "R$ 4.100,00", premioLiquido: "R$ 3.600,00", iof: "R$ 280,00",
      comissao: "22%", formaPagamento: "12x débito", franquia: "R$ 2.000,00", classeBonus: "7",
      veiculo: {
        fabricante: "Toyota", modelo: "Corolla XEi", ano: "2024",
        placa: "GHI-8J01", chassi: "9BR53ZEC5R0000003", combustivel: "Flex", fipe: "R$ 155.000,00",
      },
    },
    historico: [
      { data: "29/03/2026 09:45", tipo: "pagamento", descricao: "Parcela 12 confirmada como paga", autor: "Sistema" },
      { data: "01/04/2025 10:00", tipo: "apolice", descricao: "Apólice #4518 emitida - SulAmérica Automóvel", autor: "Sistema" },
    ],
  },
];

export function useFinanceiro() {
  return useQuery<FinanceiroClient[]>({
    queryKey: ["financeiro-clients"],
    queryFn: async () => {
      try {
        const data = await financeiroService.getAll();
        if (data && data.length > 0) return data;
        return MOCK_FINANCEIRO;
      } catch {
        return MOCK_FINANCEIRO;
      }
    },
    staleTime: 30_000,
  });
}
