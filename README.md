# Gerenciador de Tarefas

Projeto de interface web para um gerenciador de tarefas, desenvolvido com HTML, CSS e JavaScript.

## Visão geral

O projeto contém uma página inicial, formulários de cadastro e entrada e um painel de tarefas. Após enviar um dos formulários, o acesso ao painel é liberado na aba atual do navegador.

## Como executar

Abra o arquivo `index.html` em um navegador. Também é possível usar uma extensão como Live Server no Visual Studio Code para servir os arquivos localmente.

## Estrutura do projeto

| Arquivo | Descrição |
| --- | --- |
| `index.html` | Página inicial e navegação principal. |
| `cadastro.html` | Interface de cadastro e entrada. |
| `login.html` | Redireciona para a aba de entrada em `cadastro.html`. |
| `tarefas.html` | Painel com tarefas, anotações, agenda, progresso e objetivos. |
| `style.css` | Estilos das páginas. |
| `script.js` | Alternância dos formulários e controle da sessão demonstrativa. |
| `tarefas.js` | Navegação, tarefas e dados locais do painel. |

## Estado atual

Cadastro e entrada são apenas para demonstração: os dados ficam como JSON no `localStorage` deste navegador. Após o cadastro, a aba de entrada abre com e-mail e senha preenchidos; o arquivo `cadastro.txt` também é baixado. A senha fica em texto puro; use somente dados fictícios. A liberação de acesso usa `sessionStorage` e termina ao fechar a aba. Não há servidor nem sincronização entre dispositivos.
