# ftr-pos-url-api
 Criar uma aplicação que permita o cadastro, listagem e remoção de links encurtados, geração de relatório dos acessos de cada link e também o redirecionamento correto do link encurtado para o link original.

 ## Funcionalidades e Regras

<aside>


Para esse desafio é esperado que você utilize o banco de dados Postgres.

</aside>

- [X]  Deve ser possível criar um link
    - [X]  Não deve ser possível criar um link com URL encurtada mal formatada
    - [X]  Não deve ser possível criar um link com URL encurtada já existente
- [X]  Deve ser possível deletar um link
- [X]  Deve ser possível obter a URL original por meio de uma URL encurtada
- [X]  Deve ser possível listar todas as URL’s cadastradas
- [X]  Deve ser possível incrementar a quantidade de acessos de um link
- [X]  Deve ser possível exportar os links criados em um CSV
    - [X]  Deve ser possível acessar o CSV por meio de uma CDN (Amazon S3, Cloudflare R2, etc)
    - [X]  Deve ser gerado um nome aleatório e único para o arquivo
    - [X]  Deve ser possível realizar a listagem de forma performática
    - [X]  O CSV deve ter campos como, URL original, URL encurtada, contagem de acessos e data de criação.
