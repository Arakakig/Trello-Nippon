# Funcionalidade de Importação de Clientes

## Visão Geral

A funcionalidade de importação de clientes permite que você importe uma lista de clientes a partir de arquivos CSV ou Excel, facilitando o processo de cadastro em massa, especialmente útil para listas mensais de novos clientes.

## Formatos Suportados

- **CSV** (.csv)
- **Excel** (.xls, .xlsx)
- **Tamanho máximo:** 10MB

## Como Usar

### 1. Acessar a Importação

1. No dashboard, clique na aba **"Clientes"**
2. Clique no botão **"Importar"** (ícone verde de download)
3. O modal de importação será aberto

### 2. Upload do Arquivo

1. Clique em **"Selecionar arquivo"** ou arraste o arquivo para a área indicada
2. Selecione seu arquivo CSV ou Excel
3. O sistema detectará automaticamente as colunas do arquivo

### 3. Mapeamento de Colunas

1. O sistema mostrará todas as colunas encontradas no arquivo
2. Para cada campo obrigatório, selecione qual coluna do arquivo corresponde:
   - **Nome** (obrigatório)
   - **Telefone** (obrigatório)
   - **Contrato** (obrigatório)
   - **Data da Adesão** (obrigatório)
   - **Data de Contrato** (obrigatório)
   - **Data de Vencimento** (obrigatório)
   - **Plano** (obrigatório)
   - **Valor da Adesão** (obrigatório)
   - **Forma de Pagamento** (obrigatório)
   - **Confirmação** (obrigatório)
   - **Origem** (obrigatório)
   - **Observação** (opcional)
   - **Visita à Casa** (opcional)
   - **Vendedor** (opcional)

3. Clique em **"Visualizar"** para ver o preview dos dados

### 4. Preview e Validação

1. O sistema mostrará:
   - Total de linhas no arquivo
   - Quantas linhas são válidas
   - Quantas linhas têm erros
   - Taxa de sucesso
   - Lista de erros encontrados (se houver)
   - Preview dos primeiros 3 registros válidos

2. Revise os dados e erros antes de prosseguir

### 5. Importação

1. Se tudo estiver correto, clique em **"Importar Clientes"**
2. O sistema processará todos os dados válidos
3. Você receberá uma confirmação com o número de clientes importados
4. A lista de clientes será atualizada automaticamente

## Estrutura do Arquivo

### Exemplo de CSV

```csv
Nome,Telefone,Contrato,Data Adesão,Data Contrato,Data Vencimento,Plano,Valor,Forma Pagamento,Confirmação,Origem
João Silva,(11) 99999-9999,CON001,2024-01-15,2024-01-15,2024-02-15,1GAVETA,150.00,PIX,ABC123,INDICAÇÃO CLIENTE
Maria Santos,(11) 88888-8888,CON002,2024-01-16,2024-01-16,2024-02-16,2GAVETAS,200.00,DINHEIRO,DEF456,ANUNCIO
```

### Exemplo de Excel

| Nome | Telefone | Contrato | Data Adesão | Data Contrato | Data Vencimento | Plano | Valor | Forma Pagamento | Confirmação | Origem |
|------|----------|----------|-------------|---------------|-----------------|-------|-------|-----------------|-------------|---------|
| João Silva | (11) 99999-9999 | CON001 | 2024-01-15 | 2024-01-15 | 2024-02-15 | 1GAVETA | 150.00 | PIX | ABC123 | INDICAÇÃO CLIENTE |
| Maria Santos | (11) 88888-8888 | CON002 | 2024-01-16 | 2024-01-16 | 2024-02-16 | 2GAVETAS | 200.00 | DINHEIRO | DEF456 | ANUNCIO |

## Validações

### Campos Disponíveis
Todos os campos são opcionais. Você pode importar clientes com apenas os dados que possui:

- Nome
- Telefone
- Contrato
- Data da Adesão
- Data de Contrato
- Data de Vencimento
- Plano
- Valor da Adesão
- Forma de Pagamento
- Confirmação (se vazio, significa que não foi confirmado)
- Origem
- Observação
- Visita à Casa
- Vendedor

### Validações Específicas

1. **Valor da Adesão:** Deve ser um número positivo
2. **Datas:** Devem estar no formato válido (YYYY-MM-DD ou DD/MM/YYYY)
3. **Plano:** Deve ser um dos valores válidos:
   - 1GAVETA
   - 2GAVETAS
   - 3GAVETAS
   - TAXA ADM
   - CASSEMS

4. **Forma de Pagamento:** Deve ser um dos valores válidos:
   - Cobrador
   - PIX
   - BOLETO
   - DÉBITO
   - CRÉDITO
   - DINHEIRO
   - DESCONTO EM FOLHA

5. **Origem:** Deve ser um dos valores válidos:
   - INDICAÇÃO CLIENTE
   - INDICAÇÃO PARCEIRO
   - ANUNCIO
   - LIGAÇÃO
   - LISTA FRIA
   - EVENTO EXTERNO
   - PRESENCIAL
   - REATIVAÇÃO

## Dicas para Importação Bem-Sucedida

1. **Primeira linha:** Sempre use cabeçalhos descritivos
2. **Datas:** Use formato consistente (DD/MM/YYYY ou YYYY-MM-DD)
3. **Valores:** Use ponto como separador decimal (150.00)
4. **Campos obrigatórios:** Certifique-se de que todos estão preenchidos
5. **Valores válidos:** Use apenas os valores aceitos para planos, pagamentos e origens
6. **Teste primeiro:** Faça um teste com poucos registros antes de importar a lista completa

## Tratamento de Erros

- **Linhas com erro:** Serão ignoradas na importação
- **Relatório de erros:** Mostra exatamente qual linha e qual campo tem problema
- **Dados válidos:** São importados mesmo se houver linhas com erro
- **Log detalhado:** Cada erro é especificado para facilitar a correção

## Limitações

- Máximo de 10MB por arquivo
- Apenas a primeira planilha do Excel é processada
- Máximo de 1000 registros por importação (recomendado)
- Arquivo deve ter pelo menos uma linha de dados (além do cabeçalho)

## Suporte

Se encontrar problemas durante a importação:

1. Verifique o formato do arquivo
2. Confirme se todos os campos obrigatórios estão preenchidos
3. Verifique se os valores estão dentro das opções válidas
4. Teste com um arquivo menor primeiro
5. Entre em contato com o suporte técnico se necessário
