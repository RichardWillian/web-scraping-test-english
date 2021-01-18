const puppeteer = require("puppeteer");
const utils = require("../utils")

function recuperarQuestoesDialog() {

    return new Promise(async function(resolve) {

        let paginas = [];

        let urls = [
            'https://test-english.com/grammar-points/b1/future-forms/3/',
        ]

        urls.forEach(async(url) => {

            console.log(`Início Scrapping: ${url}`);

            let browser = await puppeteer.launch();
            let page = await browser.newPage();
            await page.goto(url, { waitUntil: "networkidle2" });

            let data = await page.evaluate(async() => {

                function delay(time) {
                    return new Promise(function(resolve) {
                        setTimeout(resolve, time)
                    });
                }

                async function recuperarRespostas() {

                    $("#action-button").click();

                    await delay(4000);

                    let contadorOrdemDialogo = -1;
                    $(".watupro-main-feedback").find("p").each((index, paragrafo) => {

                        if (paragrafo.innerHTML) {

                            if (index % 2 == 0) {
                                console.log(contadorOrdemDialogo);
                                pagina.exercicios[0].dialogos[contadorOrdemDialogo].explicacao = paragrafo.innerHTML;
                                console.log(pagina.exercicios[0].dialogos[contadorOrdemDialogo].explicacao)
                            } else {
                                contadorOrdemDialogo++;
                                let linhaResposta = paragrafo.innerText.replace("Correct answers", "").replace("Correct answer", "");

                                let resposta = linhaResposta.split(":")[1];
                                let numeroInput = linhaResposta.split(":")[0].trim();

                                pagina.exercicios[0].dialogos.forEach((dialogo) => {

                                    if (dialogo.fala.includes(`(input${numeroInput})`)) {
                                        let fala = dialogo.fala;
                                        dialogo.fala = fala.replace(`(input${numeroInput})`, `(resposta:${resposta})`);
                                    }
                                });
                            }
                        }
                    });
                }

                let pagina = {
                    titulo: $("#the_title_h1").text().replace("\n", ""),
                    texto_exercicio: $($("#exercises").find("h3")[0]).text(),
                    enunciado: $($("#exercises").find("h5")[0]).text(),
                    exercicios: []
                }

                async function recuperarQuestoes() {

                    let paragrafos = $($(".question-content")[0]).find("p");

                    let exercicio = {
                        numero: 1,
                        tipo: "dialog",
                        dialogos: []
                    }

                    paragrafos.each((index, paragrafo) => {

                        let dialogo = {
                            personagem: paragrafo.innerText.split(":")[0],
                            ordem: index + 1,
                            fala: "",
                            explicacao: ""
                        }

                        let posicaoInput = 0;
                        paragrafo.childNodes.forEach((elemento, ind) => {

                            switch (elemento.nodeName) {
                                case "SPAN":
                                    if (elemento.innerHTML) {
                                        posicaoInput = elemento.innerHTML;
                                    }
                                    break;
                                case "#text":
                                    if (elemento.nodeValue && elemento.nodeValue != " ") {
                                        dialogo.fala += elemento.nodeValue;
                                    }
                                    break;
                                case "INPUT":
                                    dialogo.fala += ` (input${posicaoInput}) `;
                                    break;
                            }
                        });

                        exercicio.dialogos.push(dialogo);
                    });

                    pagina.exercicios.push(exercicio);

                    await recuperarRespostas();
                }

                await recuperarQuestoes();

                return pagina;

            });

            await browser.close();

            paginas.push(data);

            console.log(`Fim Scrapping: ${url}`);
        });

        let contador = 1;
        while (true) {

            if (paginas.length == urls.length) {
                console.log(JSON.stringify(paginas));
                resolve(paginas);
                return;
            }

            await utils.delay(1000)
            console.log(`Segundos ${contador++}`);
        }
    });
}

recuperarQuestoesDialog();

module.exports = { recuperarQuestoesDialog }