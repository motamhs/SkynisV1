DROP DATABASE IF EXISTS filminis;
CREATE DATABASE filminis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE filminis;

-- ── Tabelas auxiliares

CREATE TABLE pais (
    id_pais   INT PRIMARY KEY AUTO_INCREMENT,
    nome      VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE linguagem (
    id_linguagem INT PRIMARY KEY AUTO_INCREMENT,
    nome         VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE categoria (
    id_categoria INT PRIMARY KEY AUTO_INCREMENT,
    nome         VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE produtora (
    id_produtora INT PRIMARY KEY AUTO_INCREMENT,
    nome         VARCHAR(255) NOT NULL UNIQUE
);

-- ── Pessoas

CREATE TABLE ator (
    id_ator    INT PRIMARY KEY AUTO_INCREMENT,
    nome       VARCHAR(255) NOT NULL,
    sobrenome  VARCHAR(255) NOT NULL,
    foto       VARCHAR(500),
    UNIQUE KEY uq_ator_nome_sobrenome (nome, sobrenome)
);

CREATE TABLE diretor (
    id_diretor INT PRIMARY KEY AUTO_INCREMENT,
    nome       VARCHAR(255) NOT NULL,
    sobrenome  VARCHAR(255) NOT NULL,
    UNIQUE KEY uq_diretor_nome_sobrenome (nome, sobrenome)
);

-- ── Relacionamentos N:N auxiliares 

CREATE TABLE ator_pais (
    id_ator_pais INT PRIMARY KEY AUTO_INCREMENT,
    id_ator      INT NOT NULL,
    id_pais      INT NOT NULL,
    UNIQUE KEY uq_ator_pais (id_ator, id_pais),
    FOREIGN KEY (id_ator) REFERENCES ator(id_ator),
    FOREIGN KEY (id_pais) REFERENCES pais(id_pais)
);

CREATE TABLE diretor_pais (
    id_diretor_pais INT PRIMARY KEY AUTO_INCREMENT,
    id_pais         INT NOT NULL,
    id_diretor      INT NOT NULL,
    UNIQUE KEY uq_diretor_pais (id_diretor, id_pais),
    FOREIGN KEY (id_pais)    REFERENCES pais(id_pais),
    FOREIGN KEY (id_diretor) REFERENCES diretor(id_diretor)
);

CREATE TABLE produtora_pais (
    id_produtora_pais INT PRIMARY KEY AUTO_INCREMENT,
    id_produtora      INT NOT NULL,
    id_pais           INT NOT NULL,
    UNIQUE KEY uq_produtora_pais (id_produtora, id_pais),
    FOREIGN KEY (id_produtora) REFERENCES produtora(id_produtora),
    FOREIGN KEY (id_pais)      REFERENCES pais(id_pais)
);

-- ── Filme

CREATE TABLE filme (
    id_filme               INT PRIMARY KEY AUTO_INCREMENT,
    titulo                 VARCHAR(255) NOT NULL UNIQUE,
    id_produtora_principal INT,
    orcamento              DECIMAL(15,2),
    duracao                TIME,
    sinopse                LONGTEXT,
    ano                    INT,
    poster                 VARCHAR(500),
    banner                 VARCHAR(500),
    trailer                VARCHAR(500),
    flag                   BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_produtora_principal) REFERENCES produtora(id_produtora)
);

CREATE TABLE filme_produtora (
    id_filme_produtora INT PRIMARY KEY AUTO_INCREMENT,
    id_filme           INT NOT NULL,
    id_produtora       INT NOT NULL,
    UNIQUE KEY uq_filme_produtora (id_filme, id_produtora),
    FOREIGN KEY (id_filme)      REFERENCES filme(id_filme),
    FOREIGN KEY (id_produtora)  REFERENCES produtora(id_produtora)
);

CREATE TABLE filme_pais (
    id_filme_pais INT PRIMARY KEY AUTO_INCREMENT,
    id_filme      INT NOT NULL,
    id_pais       INT NOT NULL,
    UNIQUE KEY uq_filme_pais (id_filme, id_pais),
    FOREIGN KEY (id_filme) REFERENCES filme(id_filme),
    FOREIGN KEY (id_pais)  REFERENCES pais(id_pais)
);

CREATE TABLE filme_categoria (
    id_filme_categoria INT PRIMARY KEY AUTO_INCREMENT,
    id_filme           INT NOT NULL,
    id_categoria       INT NOT NULL,
    UNIQUE KEY uq_filme_categoria (id_filme, id_categoria),
    FOREIGN KEY (id_filme)     REFERENCES filme(id_filme),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);

CREATE TABLE filme_ator (
    id_filme_ator INT PRIMARY KEY AUTO_INCREMENT,
    id_filme      INT NOT NULL,
    id_ator       INT NOT NULL,
    UNIQUE KEY uq_filme_ator (id_filme, id_ator),
    FOREIGN KEY (id_filme) REFERENCES filme(id_filme),
    FOREIGN KEY (id_ator)  REFERENCES ator(id_ator)
);

CREATE TABLE filme_diretor (
    id_filme_diretor INT PRIMARY KEY AUTO_INCREMENT,
    id_filme         INT NOT NULL,
    id_diretor       INT NOT NULL,
    UNIQUE KEY uq_filme_diretor (id_filme, id_diretor),
    FOREIGN KEY (id_filme)   REFERENCES filme(id_filme),
    FOREIGN KEY (id_diretor) REFERENCES diretor(id_diretor)
);

CREATE TABLE filme_linguagem (
    id_filme_linguagem INT PRIMARY KEY AUTO_INCREMENT,
    id_filme           INT NOT NULL,
    id_linguagem       INT NOT NULL,
    UNIQUE KEY uq_filme_linguagem (id_filme, id_linguagem),
    FOREIGN KEY (id_filme)     REFERENCES filme(id_filme),
    FOREIGN KEY (id_linguagem) REFERENCES linguagem(id_linguagem)
);

-- ── Usuário

CREATE TABLE usuario (
    id_usuario      INT AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(255) NOT NULL,
    sobrenome       VARCHAR(255),
    apelido         VARCHAR(100) UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    senha           VARCHAR(255) NOT NULL,
    data_nascimento DATE,
    imagem          VARCHAR(500),
    role            ENUM('admin','user') NOT NULL DEFAULT 'user',
    data_criacao    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Blacklist de refresh tokens

CREATE TABLE refresh_token_blacklist (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    token      VARCHAR(512) NOT NULL UNIQUE,
    criado_em  DATETIME DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO pais (nome) VALUES
('Estados Unidos'),('Reino Unido'),('Japão'),('Canadá'),('França'),
('Alemanha'),('Brasil'),('Nova Zelândia'),('Coreia do Sul'),('Espanha'),
('México'),('Chile'),('Itália'),('Suécia'),('Ucrânia'),('Austrália'),('Guatemala');

INSERT INTO linguagem (nome) VALUES
('Inglês'),('Japonês'),('Português'),('Francês'),('Espanhol'),
('Dinamarquês'),('Romeno'),('Romani'),('Russo'),('Latim'),
('Alemão'),('Italiano'),('Chinês'),('Coreano'),('Xhosa'),
('Húngaro'),('Tagalo'),('Mandarim');

INSERT INTO categoria (nome) VALUES
('Ação'),('Aventura'),('Animação'),('Comédia'),('Crime'),('Drama'),
('Fantasia'),('Ficção Científica'),('Gótico'),('Musical'),('Neo-noir'),
('Romance'),('Super-herói'),('Suspense'),('Terror'),('Thriller');

INSERT INTO produtora (nome) VALUES
('Summit Entertainment'),('Studio Ghibli'),('Regency Enterprises'),('Millenium Films'),
('6th & Idaho'),('Warner Bros.'),('Proximity Media'),('Netflix'),
('Lakeshore Entertainment'),('20th Century Fox'),('Marvel Studios'),
('Paramount Pictures'),('Thunder Road Pictures'),('Legendary Pictures'),('Sony Pictures Animation');

INSERT INTO ator (nome, sobrenome, foto) VALUES
('Kristen','Stewart','https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Kristen_Stewart_at_WWD_Style_Awards_2026.jpg/330px-Kristen_Stewart_at_WWD_Style_Awards_2026.jpg'),
('Robert','Pattinson','https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Robert_Pattinson_at_Berlinale_2025.jpg/330px-Robert_Pattinson_at_Berlinale_2025.jpg'),
('Taylor','Lautner','https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Taylor_Lautner_Comic-Con_2012.jpg/330px-Taylor_Lautner_Comic-Con_2012.jpg'),
('Yōji','Matsuda','https://ui-avatars.com/api/?name=Yoji+Matsuda&background=1a1a1a&color=ffffff&size=512'),
('Yuriko','Ishida','https://ui-avatars.com/api/?name=Yuriko+Ishida&background=1a1a1a&color=ffffff&size=512'),
('Yūko','Tanaka','https://ui-avatars.com/api/?name=Yuko+Tanaka&background=1a1a1a&color=ffffff&size=512'),
('Bill','Skarsgård','https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Bill_Skarsg%C3%A5rd_%2843573067882%29_%28cropped%29.jpg/330px-Bill_Skarsg%C3%A5rd_%2843573067882%29_%28cropped%29.jpg'),
('Lily-Rose','Depp','https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Lily-Rose_Depp_Cannes_2016.jpg/330px-Lily-Rose_Depp_Cannes_2016.jpg'),
('Nicholas','Hoult','https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Nicholas_Hoult-67849_%28cropped%29.jpg/330px-Nicholas_Hoult-67849_%28cropped%29.jpg'),
('David','Harbour','https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/David_Harbour_by_Gage_Skidmore_2.jpg/330px-David_Harbour_by_Gage_Skidmore_2.jpg'),
('Milla','Jovovich','https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Milla_Jovovich_-_Protector.jpg/330px-Milla_Jovovich_-_Protector.jpg'),
('Zoë','Kravitz','https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Zoe_Kravitz_2020_dvna_studio.jpg/330px-Zoe_Kravitz_2020_dvna_studio.jpg'),
('Paul','Dano','https://commons.wikimedia.org/wiki/Special:FilePath/Paul%20Dano%20at%20Berlinale%202024%20Ausschnitt.jpg'),
('David','Corenswet','https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/David_Corenswet_Manila_2025.jpg/330px-David_Corenswet_Manila_2025.jpg'),
('Rachel','Brosnahan','https://commons.wikimedia.org/wiki/Special:FilePath/Rachel%20Brosnahan%20%282024%29.jpg'),
('Milly','Alcock','https://commons.wikimedia.org/wiki/Special:FilePath/Milly%20alcock%20gcc%202022%202.jpg'),
('Michael','B. Jordan','https://commons.wikimedia.org/wiki/Special:FilePath/Michael%20B%20Jordan%20-%20Sinners%20%28cropped%29.jpg'),
('Hailee','Steinfeld','https://commons.wikimedia.org/wiki/Special:FilePath/Hailee%20Steinfeld%20by%20Gage%20Skidmore.jpg'),
('Oscar','Isaac','https://commons.wikimedia.org/wiki/Special:FilePath/Oscar%20Isaac%20at%2082nd%20Venice%20International%20Film%20Festival-1%20%28cropped%29.jpg'),
('Jacob','Elordi','https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/JacobElordi-TIFF2025-01_%28cropped_2%29.png/330px-JacobElordi-TIFF2025-01_%28cropped_2%29.png'),
('Mia','Goth','https://commons.wikimedia.org/wiki/Special:FilePath/MiaGoth-TIFF2025-01%20%28cropped%29.png'),
('Jason','Statham','https://commons.wikimedia.org/wiki/Special:FilePath/Jason%20Statham%202018.jpg'),
('Amy','Smart','https://commons.wikimedia.org/wiki/Special:FilePath/Amy%20Smart%20%282009%29.jpg'),
('Nicole','Kidman','https://commons.wikimedia.org/wiki/Special:FilePath/Nicole%20Kidman-66060%20%28cropped%29.jpg'),
('Ewan','McGregor','https://commons.wikimedia.org/wiki/Special:FilePath/Ewan%20McGregor%20-%20Los%20Angeles%20Comic%20Con%202024.jpg'),
('Robert','Downey Jr.','https://commons.wikimedia.org/wiki/Special:FilePath/Robert%20Downey%20Jr%202014%20Comic%20Con%20%28cropped%29.jpg'),
('Chris','Evans','https://commons.wikimedia.org/wiki/Special:FilePath/Chris%20Evans%20Red%202024.jpg'),
('Mark','Ruffalo','https://commons.wikimedia.org/wiki/Special:FilePath/Mark%20Ruffalo%20%2836201774756%29%20%28cropped%29.jpg'),
('Chris','Hemsworth','https://commons.wikimedia.org/wiki/Special:FilePath/Chris%20Hemsworth%20-%20Crime%20101.jpg'),
('Scarlett','Johansson','https://commons.wikimedia.org/wiki/Special:FilePath/Scarlett%20Johansson-8588.jpg'),
('Matthew','McConaughey','https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Matthew_McConaughey_at_the_2025_Toronto_Film_Festival_%28Cropped%29.jpg/330px-Matthew_McConaughey_at_the_2025_Toronto_Film_Festival_%28Cropped%29.jpg'),
('Anne','Hathaway','https://commons.wikimedia.org/wiki/Special:FilePath/Anne%20Hathaway-%20Press%20conference%20for%20the%20film%20%22The%20Devil%20Wears%20Prada%202%22%20-%2055194764955%20%28cropped%29.jpg'),
('Keanu','Reeves','https://commons.wikimedia.org/wiki/Special:FilePath/Keanu%20Reeves%20at%20TIFF%202025%2002%20%28Cropped%29.jpg'),
('Michael','Nyqvist','https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Michael_Nyqvist_2016.jpg/330px-Michael_Nyqvist_2016.jpg'),
('Chieko','Baishô','https://ui-avatars.com/api/?name=Chieko+Baisho&background=1a1a1a&color=ffffff&size=512'),
('Takuya','Kimura','https://commons.wikimedia.org/wiki/Special:FilePath/%E6%9C%A8%E6%9D%91%E6%8B%93%E4%B9%9F20040219.jpg'),
('Akihiro','Miwa','https://commons.wikimedia.org/wiki/Special:FilePath/Akihiro%20Miwa%20%E7%BE%8E%E8%BC%AA%20%E6%98%8E%E5%AE%8F.jpg'),
('Tom','Holland','https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Tom_Holland_during_pro-am_Wentworth_golf_club_2023-2_%28cropped%29.jpg/330px-Tom_Holland_during_pro-am_Wentworth_golf_club_2023-2_%28cropped%29.jpg'),
('Zendaya','','https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Zendaya_-_2019_by_Glenn_Francis.jpg/330px-Zendaya_-_2019_by_Glenn_Francis.jpg'),
('Benedict','Cumberbatch','https://commons.wikimedia.org/wiki/Special:FilePath/BCumberbatch%20Comic-Con%202019.jpg'),
('Margot','Robbie','https://commons.wikimedia.org/wiki/Special:FilePath/Margot%20Robbie%20at%2029th%20Critics%27%20Choice%20Awards.jpg%20%28brightened%29.png'),
('Ryan','Gosling','https://commons.wikimedia.org/wiki/Special:FilePath/GoslingBFI081223%20%2822%20of%2030%29%20%2853388157347%29%20%28cropped%29.jpg'),
('America','Ferrera','https://commons.wikimedia.org/wiki/Special:FilePath/America%20Ferrera%20at%20the%202025%20Toronto%20International%20Film%20Festival%20%28cropped2%29.jpg'),
('Ryan','Reynolds','https://commons.wikimedia.org/wiki/Special:FilePath/Deadpool%202%20Japan%20Premiere%20Red%20Carpet%20Ryan%20Reynolds%20%28cropped%29.jpg'),
('Morena','Baccarin','https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Morena_Baccarin_in_2016_%2829947145950%29.jpg/330px-Morena_Baccarin_in_2016_%2829947145950%29.jpg'),
('Timothée','Chalamet','https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Timoth%C3%A9e_Chalamet-63482_%28cropped%29.jpg/330px-Timoth%C3%A9e_Chalamet-63482_%28cropped%29.jpg'),
('Rebecca','Ferguson','https://commons.wikimedia.org/wiki/Special:FilePath/Rebecca%20Ferguson%20Milan%20Italy.jpg'),
('Laurence','Fishburne','https://commons.wikimedia.org/wiki/Special:FilePath/Laurence%20Fishburne%20at%2053rd%20Saturn%20Awards%202026.jpg'),
('Carrie-Anne','Moss','https://commons.wikimedia.org/wiki/Special:FilePath/Carrie-Anne%20Moss%2007%20TIFF.jpg'),
('Arden','Cho','https://commons.wikimedia.org/wiki/Special:FilePath/Arden%20Cho%20%282019%29.jpg'),
('May','Hong','https://commons.wikimedia.org/wiki/Special:FilePath/May%20Hong%20%2854870039482%29%20%28cropped%29.jpg'),
('Ji-young','Yoo','https://commons.wikimedia.org/wiki/Special:FilePath/Ji-young%20Yoo%20by%20Gage%20Skidmore.jpg');

INSERT INTO diretor (nome, sobrenome) VALUES
('Catherine','Hardwicke'),('Hayao','Miyazaki'),('Robert','Eggers'),
('Neil','Marshall'),('Matt','Reeves'),('James','Gunn'),
('Ryan','Coogler'),('Guillermo','del Toro'),('Mark','Neveldine'),
('Brian','Taylor'),('Baz','Luhrmann'),('Anthony','Russo'),
('Joe','Russo'),('Christopher','Nolan'),('Chad','Stahelski'),
('Jon','Watts'),('Greta','Gerwig'),('Tim','Miller'),
('Denis','Villeneuve'),('Lana','Wachowski'),('Lilly','Wachowski'),
('Maggie','Kang'),('Chris','Appelhans');

INSERT INTO filme (titulo, id_produtora_principal, orcamento, duracao, sinopse, ano, poster, banner, trailer, flag) VALUES
('Crepúsculo',1,37000000,'02:02:00',
'Bella Swan se apaixona pelo misterioso e deslumbrante Edward Cullen, descobrindo que ele é um vampiro.',
2008,
'https://br.web.img2.acsta.net/medias/nmedia/18/87/02/32/19871201.jpg',
'https://cdn.crusoe.com.br/uploads/2025/08/AAAABWfz8lKE462s2FJGRKy547BrnBCeFrkDfXSfioM73OJkgn-Ee0du7Pz3T4ekqvxe3iFYw6z10S0SlMcoiKwe2xeGRYqNJ6QD-Qyk.jpg',
'https://www.youtube.com/watch?v=QDRLSqm_WVg',
TRUE),
('A Princesa Mononoke',2,20000000,'02:13:00',
'Um jovem guerreiro se envolve em um conflito entre deuses da floresta e humanos que destroem a natureza.',
1997,
'https://i0.wp.com/studioghibli.com.br/wp-content/uploads/2025/03/Poster-Princesa-Mononoke-IMAX-scaled.jpeg',
'https://i0.wp.com/www.otakupt.com/wp-content/uploads/2025/08/Princesa-Mononoke_Poster-IMAX_-Capa.jpg?fit=1920%2C1081&ssl=1',
'https://www.youtube.com/watch?v=4OiMOHRDs14',
TRUE),
('Nosferatu',3,50000000,'02:12:00',
'Uma jovem casada é assombrada por um antigo mal enquanto seu marido viaja para fechar negócio com um misterioso conde.',
2024,
'https://m.media-amazon.com/images/I/715BLU5YPZL.jpg',
'https://i.redd.it/3wqvh4akdtbe1.jpeg',
'https://www.youtube.com/watch?v=b59rxDB_JRg',
TRUE),
('Hellboy',4,50000000,'02:01:00',
'Um ser sobrenatural luta contra forças das trevas enquanto protege o mundo humano.',
2019,
'https://m.media-amazon.com/images/M/MV5BZjI1Yzc0M2MtZjc5Ny00ZDU0LWE3NzEtOWY5ODk2MzdhZThjXkEyXkFqcGc@._V1_.jpg',
'https://www.scifinow.co.uk/wp-content/uploads/2018/10/Screen-Shot-2018-10-08-at-14.11.22-616x286.png',
'https://www.youtube.com/watch?v=ZsBO4b3tyZg',
TRUE),
('The Batman',5,185000000,'02:56:00',
'Bruce Wayne rastreia um assassino serial chamado Charada que expõe a corrupção em Gotham.',
2022,
'https://deixeser.com/wp-content/uploads/2022/03/5653084.jpg',
'https://poltronanerd.com.br/wp-content/uploads/2024/12/batman-2.jpg',
'https://www.youtube.com/watch?v=mqqft2x_Aa4',
TRUE),
('Superman',6,225000000,'02:30:00',
'Clark Kent abraça seu legado kryptoniano enquanto enfrenta Lex Luthor.',
2025,
'https://ingresso-a.akamaihd.net/b2b/production/uploads/articles-content/8923869c-f8a6-4258-ba74-4170bf7fb202.jpg',
'https://ingresso-a.akamaihd.net/b2b/production/uploads/articles-content/8923869c-f8a6-4258-ba74-4170bf7fb202.jpg',
'https://www.youtube.com/watch?v=uhUht6vAsMY',
TRUE),
('Pecadores',7,90000000,'02:17:00',
'Dois irmãos retornam ao Mississippi para abrir um negócio, mas o sobrenatural bate à porta.',
2025,
'https://ingresso-a.akamaihd.net/prd/img/movie/pecadores/7f6c9699-002e-43a8-adb3-49d2055014fd.webp',
'https://ingresso-a.akamaihd.net/prd/img/movie/pecadores/7f6c9699-002e-43a8-adb3-49d2055014fd.webp',
'https://www.youtube.com/watch?v=bKGxHflevuk',
TRUE),
('Frankenstein',8,120000000,'02:30:00',
'Guillermo del Toro adapta o clássico de Mary Shelley sobre um cientista que cria vida.',
2025,
'https://s3.amazonaws.com/nightjarprod/content/uploads/sites/130/2025/08/31180656/frankenstein-2025-poster-691x1024.jpg',
'https://s3.amazonaws.com/nightjarprod/content/uploads/sites/130/2025/08/31180656/frankenstein-2025-poster-691x1024.jpg',
'https://www.youtube.com/watch?v=8aulMPhE12g',
TRUE),
('Adrenalina',9,12000000,'01:28:00',
'Envenenado por rivais, o assassino Chev Chelios precisa manter sua adrenalina alta para sobreviver.',
2006,
'https://br.web.img3.acsta.net/medias/nmedia/18/86/97/09/19870658.jpg',
'https://br.web.img3.acsta.net/medias/nmedia/18/86/97/09/19870658.jpg',
'https://www.youtube.com/watch?v=218nsccFpag',
TRUE),
('Moulin Rouge',10,50000000,'02:06:00',
'Um jovem escritor se apaixona pela estrela do Moulin Rouge em um Paris boêmio.',
2001,
'https://uauposters.com.br/media/catalog/product/3/4/346820211103-uau-posters-moulin-rouge-filmes.jpg',
'https://uauposters.com.br/media/catalog/product/3/4/346820211103-uau-posters-moulin-rouge-filmes.jpg',
'https://www.youtube.com/watch?v=2PpgPxjzbkA',
TRUE),
('Vingadores: Ultimato',11,356000000,'03:01:00',
'Os Vingadores se unem para reverter os efeitos devastadores do Thanos.',
2019,
'https://br.web.img3.acsta.net/pictures/19/04/26/17/30/2428965.jpg',
'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
'https://www.youtube.com/watch?v=TcMBFSGVi1c',
TRUE),
('Interestelar',12,165000000,'02:49:00',
'Um ex-piloto viaja por um buraco de minhoca em busca de um novo lar para a humanidade.',
2014,
'https://br.web.img3.acsta.net/pictures/14/10/31/20/39/476171.jpg',
'https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
'https://www.youtube.com/watch?v=zSWdZVtXT7E',
TRUE),
('John Wick',13,20000000,'01:41:00',
'Um ex-assassino retorna à ativa para vingar a morte de seu cachorro, presente da esposa falecida.',
2014,
'https://m.media-amazon.com/images/M/MV5BMTU2NjA1ODgzMF5BMl5BanBnXkFtZTgwMTM2MTI4MjE@._V1_.jpg',
'https://image.tmdb.org/t/p/original/umC04Cozevu8nn3JTDJ1pc7PVTn.jpg',
'https://www.youtube.com/watch?v=inhF1DSNUAw',
TRUE),
('O Castelo Animado',2,24000000,'01:59:00',
'Sophie é amaldiçoada e transformada em velha; busca quebrar o feitiço no castelo do mago Howl.',
2004,
'https://i.pinimg.com/474x/ec/f5/96/ecf596b4b836dba11873a07b12381088.jpg',
'https://i.pinimg.com/474x/ec/f5/96/ecf596b4b836dba11873a07b12381088.jpg',
'https://www.youtube.com/watch?v=iwROgK94zcM',
TRUE),
('Homem-Aranha: Sem Volta Para Casa',11,200000000,'02:28:00',
'Peter Parker pede ao Doutor Estranho para fazer o mundo esquecer sua identidade, fragmentando o multiverso.',
2021,
'https://cinecriticas.com.br/wp-content/uploads/2021/12/Cine1-12.jpg',
'https://image.tmdb.org/t/p/original/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
'https://www.youtube.com/watch?v=JfVOs4VSpmA',
TRUE),
('Barbie',6,145000000,'01:54:00',
'Barbie deixa Barbieland e vai ao mundo real para resolver uma crise existencial.',
2023,
'https://uauposters.com.br/media/catalog/product/cache/1/thumbnail/800x930/9df78eab33525d08d6e5fb8d27136e95/4/5/454520230615-uau-posters-barbie-2023-filmes-1.jpg',
'https://image.tmdb.org/t/p/original/nHf61UzkfFno5X1ofIhugCPus2R.jpg',
'https://www.youtube.com/watch?v=pBk4NYhWNMM',
TRUE),
('Deadpool',10,58000000,'01:48:00',
'Wade Wilson se torna o mercenário de boca suja Deadpool após um experimento que lhe dá poderes de regeneração.',
2016,
'https://m.media-amazon.com/images/M/MV5BYjYzYjcyZTgtNWQ3OS00NTA4LWE4MjMtZTgxOWJmZjU1ZmFiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
'https://image.tmdb.org/t/p/original/en971MEXui9diirXlogOrPKmsEn.jpg',
'https://www.youtube.com/watch?v=ONHBaC-pfsk',
TRUE),
('Duna',14,165000000,'02:35:00',
'Paul Atreides lidera uma revolta no planeta mais perigoso do universo.',
2021,
'https://br.web.img3.acsta.net/c_310_420/pictures/21/09/29/20/10/5897145.jpg',
'https://image.tmdb.org/t/p/original/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg',
'https://www.youtube.com/watch?v=n9xhJrPXop4',
TRUE),
('Matrix',6,63000000,'02:16:00',
'Um hacker descobre que a realidade é uma simulação e se junta à resistência humana.',
1999,
'https://m.media-amazon.com/images/M/MV5BZGM1NDM3MTAtMmI0ZC00ZDAwLWEwY2EtNDdhYjZmMjJkNzM0XkEyXkFqcGc@._V1_.jpg',
'https://image.tmdb.org/t/p/original/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg',
'https://www.youtube.com/watch?v=vKQi3bBA1y8',
TRUE),
('KPop Demon Hunters',15,80000000,'01:45:00',
'Um grupo de K-Pop mundialmente famoso equilibra a vida no palco com sua identidade secreta de caçadoras de demônios.',
2025,
'https://m.media-amazon.com/images/I/81Mtr7elTnL.jpg',
'https://m.media-amazon.com/images/I/81Mtr7elTnL.jpg',
'https://www.youtube.com/watch?v=3JTVQTk36R8',
TRUE);

-- Relações N:N 

INSERT INTO filme_produtora (id_filme, id_produtora) VALUES
(1,1),(2,2),(3,3),(4,4),(5,5),(6,6),(7,7),(8,8),(9,9),(10,10),
(11,11),(12,12),(12,6),(13,13),(14,2),(15,11),(16,6),(17,10),(17,11),(18,14),(19,6),(20,15);

INSERT INTO filme_pais (id_filme, id_pais) VALUES
(1,1),(2,3),(3,1),(4,1),(5,1),(6,1),(7,1),(8,1),(9,1),(10,5),
(11,1),(12,1),(13,1),(14,3),(15,1),(16,1),(17,1),(18,1),(19,1),(20,9);

INSERT INTO filme_diretor (id_filme, id_diretor) VALUES
(1,1),(2,2),(3,3),(4,4),(5,5),(6,6),(7,7),(8,8),(9,9),(9,10),
(10,11),(11,12),(11,13),(12,14),(13,15),(14,2),(15,16),(16,17),(17,18),
(18,19),(19,20),(19,21),(20,22),(20,23);

INSERT INTO filme_linguagem (id_filme, id_linguagem) VALUES
(1,1),(2,2),(3,1),(3,7),(3,8),(3,9),(3,10),(3,11),
(4,1),(4,5),(4,6),(4,11),(5,1),(5,5),(5,10),(6,1),
(7,1),(7,13),(8,1),(8,6),(8,4),(9,1),(9,5),
(10,1),(10,4),(10,5),(11,1),(11,2),(11,15),(11,11),(12,1),
(13,1),(13,11),(13,16),(14,2),(15,1),(15,17),(16,1),(16,5),
(17,1),(18,1),(18,18),(19,1),(20,1),(20,14);

INSERT INTO filme_categoria (id_filme, id_categoria) VALUES
(1,7),(1,12),(1,6),(2,7),(2,2),(2,3),(3,15),(3,8),(4,7),(4,1),(4,15),
(5,1),(5,6),(5,11),(5,13),(6,1),(6,7),(6,13),(7,15),(7,7),(7,6),
(8,15),(8,6),(8,8),(9,1),(9,5),(9,16),(10,6),(10,10),(10,12),
(11,1),(11,2),(11,7),(11,13),(12,8),(12,2),(13,1),(13,14),(14,7),(14,3),
(15,1),(15,2),(15,8),(15,13),(16,4),(16,7),(17,1),(17,4),(17,13),
(18,8),(18,2),(19,1),(19,8),(20,3),(20,7),(20,10);

INSERT INTO filme_ator (id_filme, id_ator) VALUES
(1,1),(1,2),(1,3),(2,4),(2,5),(2,6),(3,7),(3,8),(3,9),(4,10),(4,11),
(5,2),(5,12),(5,13),(6,14),(6,15),(6,16),(7,17),(7,18),(8,19),(8,20),(8,21),
(9,22),(9,23),(10,24),(10,25),(11,26),(11,27),(11,28),(11,29),(11,30),
(12,31),(12,32),(13,33),(13,34),(14,35),(14,36),(14,37),(15,38),(15,39),(15,40),
(16,41),(16,42),(16,43),(17,44),(17,45),(18,46),(18,47),(18,19),(18,39),
(19,33),(19,48),(19,49),(20,50),(20,51),(20,52);

INSERT INTO ator_pais (id_ator, id_pais) VALUES
(1,1),(2,2),(3,1),(4,3),(5,3),(6,3),(7,14),(8,1),(9,2),(10,1),
(11,15),(12,1),(13,1),(14,1),(15,1),(16,16),(17,1),(18,1),(19,17),(20,16),
(21,2),(22,2),(23,1),(24,16),(25,2),(26,1),(27,1),(28,1),(29,16),(30,1),
(31,1),(32,1),(33,4),(34,14),(35,3),(36,3),(37,3),(38,2),(39,1),(40,2),
(41,16),(42,4),(43,1),(44,1),(45,7),(46,1),(47,14),(48,1),(49,1),(50,1),
(51,9),(52,1);

INSERT INTO diretor_pais (id_diretor, id_pais) VALUES
(1,1),(2,3),(3,1),(4,2),(5,1),(6,1),(7,1),(8,11),(9,1),(10,1),
(11,16),(12,1),(13,1),(14,2),(15,1),(16,1),(17,1),(18,1),(19,4),(20,1),
(21,1),(22,9),(23,1);

INSERT INTO produtora_pais (id_produtora, id_pais) VALUES
(1,1),(2,3),(3,1),(4,1),(5,1),(6,1),(7,1),(8,1),(9,1),(10,1),
(11,1),(12,1),(13,1),(14,1),(15,1);


