# ✅ Checklist de Homologação AGT — Gestor de Vendas Angola

Este documento serve como guia para validar todos os requisitos antes da submissão oficial à AGT.

---

## 1. Deploy e Ambiente
- [ ] Validar deploy manual no Netlify/Vercel.
- [ ] Confirmar variáveis de ambiente:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
- [ ] Testar funções `check-anon` e `check-supabase` no domínio ativo.
- [ ] Garantir que não existem ficheiros duplicados (`vite.config.ts` removido).
- [ ] Confirmar que `index.html` aponta corretamente para `/src/index.tsx`.

---

## 2. Geração SAF-T AO
- [ ] Testar módulo `src/utils/saftAO.ts` com dados reais.
- [ ] Validar cabeçalho (empresa, NIF, versão, data).
- [ ] Confirmar exportação de clientes, produtos e impostos.
- [ ] Validar faturas com totais líquidos, impostos e brutos.
- [ ] Gerar ficheiro XML e verificar conformidade com especificação AGT.

---

## 3. Documentação
- [ ] Manual do Utilizador (emissão de faturas, exportação SAF-T AO).
- [ ] Manual Técnico (arquitetura, variáveis de ambiente, fluxo de deploy).
- [ ] Guia de Troubleshooting (erros comuns e soluções).
- [ ] Checklist final anexado ao repositório.

---

## 4. Testes Finais
- [ ] Validar acesso público ao domínio ativo.
- [ ] Confirmar que o sistema funciona em ambiente mobile e desktop.
- [ ] Testar exportação SAF-T AO em diferentes períodos (mensal).
- [ ] Revisar logs de deploy e corrigir warnings/erros.
- [ ] Preparar pacote final para submissão à AGT.

---

## 5. Submissão
- [ ] Compilar documentação completa.
- [ ] Anexar ficheiro SAF-T AO de teste.
- [ ] Submeter à AGT para homologação oficial.
