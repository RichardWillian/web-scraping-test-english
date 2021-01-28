const puppeteer = require("puppeteer");
const utils = require("../utils")

function recuperarQuestoesInputComum() {

    return new Promise(async function(resolve) {

        let paginas = [];

        let urls = [
            'https://test-english.com/grammar-points/a1/present-simple-forms-of-to-be/2/',
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

                let pagina = {
                    titulo: $("#the_title_h1").text().replace("\n", ""),
                    texto_exercicio: $($("#exercises").find("h3")[0]).text(),
                    enunciado: $($("#exercises").find("h5")[0]).text(),
                    exercicios: []
                }

                async function recuperarRespostas() {
                    $("#action-button").click();

                    await delay(4000);

                    let contadorResposta = 0;
                    let contadorExplicacao = 0;

                    $(".watupro-main-feedback").find("p").each((index, paragrafo) => {

                        if (paragrafo.innerHTML) {
                            let paragrafoRespostaSingular = paragrafo.innerText.includes("Correct answer");
                            let paragrafoRespostaPlural = paragrafo.innerText.includes("Correct answers");

                            if (paragrafoRespostaSingular || paragrafoRespostaPlural) {
                                let linhaInformacoesHTML = paragrafo.innerHTML;

                                let respostas = [];
                                var explicacoes = [];

                                let linhaInformacoesSplitada = linhaInformacoesHTML.replace("&nbsp;", "").split("<br>");

                                linhaInformacoesSplitada.forEach((informacaoSplitada) => {

                                    if (informacaoSplitada != "") {
                                        let $informacaoSplitada = $(informacaoSplitada)[0];

                                        if ($informacaoSplitada.innerText != "") {

                                            let linhaResposta = $informacaoSplitada.innerText.replace("Correct answers", "").replace("Correct answer", "").replace(": ", "");
                                            linhaResposta.split("  ").forEach((resp) => {
                                                respostas.push({
                                                    nome: `(input${++contadorResposta})`,
                                                    valor: resp
                                                });
                                            });
                                        } else {
                                            explicacoes.push({ nome: `(input${++contadorExplicacao})`, valor: informacaoSplitada });
                                        }
                                    }
                                });

                                respostas.forEach((resposta, i) => {

                                    pagina.exercicios.forEach((exercicio) => {

                                        exercicio.inputs.forEach((input) => {

                                            if (input.nome == resposta.nome) {
                                                input.resposta = resposta.valor;

                                                if (explicacoes[i]) {
                                                    input.explicacao = explicacoes[i].valor;
                                                }
                                            }
                                        });

                                    });

                                });

                            }
                        }
                    });
                }

                async function recuperarQuestoes() {

                    let paragrafos = $($(".question-content")).find("p");

                    let posicaoInput = 0;
                    paragrafos.each((index, paragrafo) => {

                        let exercicio = {
                            numero: index + 1,
                            tipo: "input",
                            textoQuestao: "",
                            inputs: []
                        }

                        paragrafo.childNodes.forEach((elemento, ind) => {

                            switch (elemento.nodeName) {
                                case "#text":
                                    if (elemento.nodeValue && elemento.nodeValue != " ") {
                                        exercicio.textoQuestao += elemento.nodeValue;
                                    }
                                    break;
                                case "INPUT":
                                    posicaoInput++;
                                    let input = {
                                        posicao: 0,
                                        nome: "",
                                        resposta: "",
                                        explicacao: ""
                                    }

                                    input.nome = `(input${posicaoInput})`;
                                    input.posicao = posicaoInput;

                                    exercicio.textoQuestao += ` (input${posicaoInput}) `;
                                    exercicio.inputs.push(input);
                                    break;
                            }
                        });

                        pagina.exercicios.push(exercicio);
                    });

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
                resolve(paginas);
                return;
            }

            await utils.delay(1000)
            console.log(`Segundos ${contador++}`);
        }
    });
}

module.exports = { recuperarQuestoesInputComum }