# Testes manuais da API

Requisições feitas com a API rodando em `localhost:3333`.

| # | Teste | Rota | Esperado | Recebido | Resultado |
|---|---|---|---|---|---|
| 1 | Indicadores de outubro | `GET /api/indicadores` | 200 | 200 | OK |
| 2 | Indicadores com filtro de prioridade | `GET /api/indicadores` | 200 | 200 | OK |
| 3 | Chamados por mês | `GET /api/chamados-por-periodo` | 200 | 200 | OK |
| 4 | Situação dos chamados | `GET /api/situacao` | 200 | 200 | OK |
| 5 | Tipos mais atendidos | `GET /api/tipos` | 200 | 200 | OK |
| 6 | Opções de filtro | `GET /api/filtros` | 200 | 200 | OK |
| 7 | Lista de chamados em andamento | `GET /api/chamados` | 200 | 200 | OK |
| 8 | Detalhe do chamado | `GET /api/chamados/472` | 200 | 200 | OK |
| 9 | Iniciar sem técnico (regra) | `PATCH /api/chamados/472` | 422 | 422 | OK |
| 10 | Iniciar com técnico | `PATCH /api/chamados/472` | 200 | 200 | OK |
| 11 | Resolver sem solução (regra) | `PATCH /api/chamados/472` | 422 | 422 | OK |
| 12 | Resolver com solução | `PATCH /api/chamados/472` | 200 | 200 | OK |
| 13 | Fechar chamado | `PATCH /api/chamados/472` | 200 | 200 | OK |
| 14 | Reabrir chamado fechado (regra) | `PATCH /api/chamados/472` | 422 | 422 | OK |
| 15 | Adicionar consideração | `POST /api/chamados/472/consideracoes` | 201 | 201 | OK |
| 16 | Consideração sem texto | `POST /api/chamados/472/consideracoes` | 400 | 400 | OK |
| 17 | Filtro com data inválida | `GET /api/indicadores` | 400 | 400 | OK |
| 18 | Agrupamento inválido | `GET /api/chamados-por-periodo` | 400 | 400 | OK |
| 19 | Chamado inexistente | `GET /api/chamados/99999` | 404 | 404 | OK |
| 20 | JSON inválido | `PATCH /api/chamados/472` | 400 | 400 | OK |

## Requisições e respostas

### 1. Indicadores de outubro

`GET /api/indicadores?data_inicio=2026-10-01&data_fim=2026-10-31`

Resposta `200`:

```json
{
  "total": 122,
  "em_aberto": 0,
  "atendidos": 115,
  "cancelados": 7,
  "atrasados": 0,
  "sla_percentual": 73,
  "tempo_medio_horas": 21
}
```

### 2. Indicadores com filtro de prioridade

`GET /api/indicadores?prioridade=alta`

Resposta `200`:

```json
{
  "total": 124,
  "em_aberto": 10,
  "atendidos": 109,
  "cancelados": 5,
  "atrasados": 8,
  "sla_percentual": 69.7,
  "tempo_medio_horas": 6.1
}
```

### 3. Chamados por mês

`GET /api/chamados-por-periodo?agrupamento=mes`

Resposta `200`:

```json
[
  {
    "periodo": "2026-07",
    "abertos": 53,
    "atendidos": 48
  },
  {
    "periodo": "2026-08",
    "abertos": 110,
    "atendidos": 102
  },
  {
    "periodo": "2026-09",
    "abertos": 110,
    "atendidos": 110
  }
]
```

### 4. Situação dos chamados

`GET /api/situacao`

Resposta `200`:

```json
[
  {
    "status": "aberto",
    "nome": "Aberto",
    "total": 11
  },
  {
    "status": "em_andamento",
    "nome": "Em andamento",
    "total": 21
  },
  {
    "status": "resolvido",
    "nome": "Resolvido",
    "total": 14
  }
]
```

### 5. Tipos mais atendidos

`GET /api/tipos`

Resposta `200`:

```json
[
  {
    "tipo": "PDV / Caixa",
    "total": 149,
    "atendidos": 134
  },
  {
    "tipo": "Impressora de pedidos",
    "total": 99,
    "atendidos": 87
  },
  {
    "tipo": "Aplicativo de delivery",
    "total": 65,
    "atendidos": 55
  }
]
```

### 6. Opções de filtro

`GET /api/filtros`

Resposta `200`:

```json
{
  "categorias": [
    {
      "id": 6,
      "nome": "Acesso e senhas"
    },
    {
      "id": 3,
      "nome": "Aplicativo de delivery"
    },
    {
      "id": 5,
      "nome": "Equipamentos de cozinha"
    },
    {
      "id": 2,
      "nome": "Impressora de pedidos"
    },
    {
      "id": 1,
      "nome": "PDV / Caixa"
    },
    {
      "id": 4,
      "nome": "Rede e internet"
    }
  ],
  "tecnicos": [
    {
      "id": 1,
      "nome": "Ana Souza"
    },
    {
      "id": 2,
      "nome": "Bruno Lima"
    },
    {
      "id": 3,
      "nome": "Carla Mendes"
    },
    {
      "id": 4,
      "nome": "Diego Rocha"
    }
  ],
  "unidades": [
    {
      "id": 2,
      "nome": "Braz Cubas"
    },
    {
      "id": 1,
      "nome": "Centro"
    },
    {
      "id": 4,
      "nome": "Guarulhos"
    },
    {
      "id": 3,
      "nome": "Suzano"
    },
    {
      "id": 5,
      "nome": "Tatuapé"
    }
  ],
  "status": [
    {
      "id": "aberto",
      "nome": "Aberto"
    },
    {
      "id": "em_andamento",
      "nome": "Em andamento"
    },
    {
      "id": "resolvido",
      "nome": "Resolvido"
    },
    {
      "id": "fechado",
      "nome": "Fechado"
    },
    {
      "id": "cancelado",
      "nome": "Cancelado"
    }
  ]
}
```

### 7. Lista de chamados em andamento

`GET /api/chamados?status=em_andamento`

Resposta `200`:

```json
{
  "dados": [
    {
      "id": 471,
      "titulo": "Maquininha não conecta",
      "categoria_id": 1,
      "unidade_id": 5,
      "tecnico_id": 3,
      "prioridade": "media",
      "status": "em_andamento",
      "aberto_em": "2026-11-12 17:14:00",
      "prazo_em": "2026-11-13 17:14:00",
      "resolvido_em": null,
      "categoria": "PDV / Caixa",
      "unidade": "Tatuapé",
      "tecnico": "Carla Mendes"
    }
  ],
  "total": 21,
  "pagina": 1,
  "paginas": 3
}
```

### 8. Detalhe do chamado

`GET /api/chamados/472`

Resposta `200`:

```json
{
  "id": 472,
  "titulo": "Wi-Fi instável no caixa",
  "categoria_id": 4,
  "unidade_id": 4,
  "tecnico_id": null,
  "prioridade": "media",
  "status": "aberto",
  "aberto_em": "2026-11-12 18:13:00",
  "prazo_em": "2026-11-13 18:13:00",
  "resolvido_em": null,
  "categoria": "Rede e internet",
  "unidade": "Guarulhos",
  "tecnico": null,
  "consideracoes": []
}
```

### 9. Iniciar sem técnico (regra)

`PATCH /api/chamados/472`

```json
{"status":"em_andamento"}
```

Resposta `422`:

```json
{
  "erro": "Escolha um técnico para iniciar o atendimento"
}
```

### 10. Iniciar com técnico

`PATCH /api/chamados/472`

```json
{"status":"em_andamento","tecnico_id":2}
```

Resposta `200`:

```json
{
  "id": 472,
  "titulo": "Wi-Fi instável no caixa",
  "categoria_id": 4,
  "unidade_id": 4,
  "tecnico_id": 2,
  "prioridade": "media",
  "status": "em_andamento",
  "aberto_em": "2026-11-12 18:13:00",
  "prazo_em": "2026-11-13 18:13:00",
  "resolvido_em": null,
  "categoria": "Rede e internet",
  "unidade": "Guarulhos",
  "tecnico": "Bruno Lima"
}
```

### 11. Resolver sem solução (regra)

`PATCH /api/chamados/472`

```json
{"status":"resolvido"}
```

Resposta `422`:

```json
{
  "erro": "Descreva a solução com pelo menos 10 caracteres"
}
```

### 12. Resolver com solução

`PATCH /api/chamados/472`

```json
{"status":"resolvido","solucao":"Cabo de rede trocado e testado."}
```

Resposta `200`:

```json
{
  "id": 472,
  "titulo": "Wi-Fi instável no caixa",
  "categoria_id": 4,
  "unidade_id": 4,
  "tecnico_id": 2,
  "prioridade": "media",
  "status": "resolvido",
  "aberto_em": "2026-11-12 18:13:00",
  "prazo_em": "2026-11-13 18:13:00",
  "resolvido_em": "2026-11-12 20:39:00",
  "categoria": "Rede e internet",
  "unidade": "Guarulhos",
  "tecnico": "Bruno Lima"
}
```

### 13. Fechar chamado

`PATCH /api/chamados/472`

```json
{"status":"fechado"}
```

Resposta `200`:

```json
{
  "id": 472,
  "titulo": "Wi-Fi instável no caixa",
  "categoria_id": 4,
  "unidade_id": 4,
  "tecnico_id": 2,
  "prioridade": "media",
  "status": "fechado",
  "aberto_em": "2026-11-12 18:13:00",
  "prazo_em": "2026-11-13 18:13:00",
  "resolvido_em": "2026-11-12 20:39:00",
  "categoria": "Rede e internet",
  "unidade": "Guarulhos",
  "tecnico": "Bruno Lima"
}
```

### 14. Reabrir chamado fechado (regra)

`PATCH /api/chamados/472`

```json
{"status":"aberto"}
```

Resposta `422`:

```json
{
  "erro": "Não é possível mudar de fechado para aberto"
}
```

### 15. Adicionar consideração

`POST /api/chamados/472/consideracoes`

```json
{"autor":"Bruno Lima","texto":"Unidade confirmou que está funcionando."}
```

Resposta `201`:

```json
{
  "id": 422,
  "chamado_id": 472,
  "autor": "Bruno Lima",
  "texto": "Unidade confirmou que está funcionando.",
  "criado_em": "2026-11-12 20:39:00"
}
```

### 16. Consideração sem texto

`POST /api/chamados/472/consideracoes`

```json
{}
```

Resposta `400`:

```json
{
  "erro": "Preencha autor e texto (mínimo 5 caracteres)",
  "campos": [
    "autor",
    "texto"
  ]
}
```

### 17. Filtro com data inválida

`GET /api/indicadores?data_inicio=2026-02-30`

Resposta `400`:

```json
{
  "erro": "Filtro inválido",
  "campos": [
    "data_inicio"
  ]
}
```

### 18. Agrupamento inválido

`GET /api/chamados-por-periodo?agrupamento=ano`

Resposta `400`:

```json
{
  "erro": "Agrupamento deve ser dia ou mes",
  "campos": [
    "agrupamento"
  ]
}
```

### 19. Chamado inexistente

`GET /api/chamados/99999`

Resposta `404`:

```json
{
  "erro": "Chamado não encontrado"
}
```

### 20. JSON inválido

`PATCH /api/chamados/472`

```json
{"status":
```

Resposta `400`:

```json
{
  "erro": "JSON inválido"
}
```
