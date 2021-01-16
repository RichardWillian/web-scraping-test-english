const axios = require("axios");
const fs = require("fs");
const metodoBrowser = require("./metodo_browser");

const BASE_URL = "https://test-english.com/";

const slug = (str) => {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to = "aaaaeeeeiiiioooouuuunc------";
    for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}

const recuperarPagina = () => {

    const url = BASE_URL + path;

    return axios.get(url).then((response) => response.data);
}

const escreverArquivo = (data, path) => {

    const promiseCallback = (resolve, reject) => {

        fs.writeFile(path, data, (error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(true);
        });
    }

    return new Promise(promiseCallback);
}

const getCachedPage = (path) => {
    const filename = `cache/${slug(path)}.html`;

    const promiseCallback = async(resolve) => {

        const cachedHTML = await readFromFile(filename);

        if (!cachedHTML) {
            const html = await recuperarPagina(path);
            escreverArquivo(html, filename)
            resolve(html);
            return;
        }
        resolve(cachedHTML);
    }

    return new Promise(promiseCallback);
}

const readFromFile = (filename) => {
    const promiseCallback = async(resolve) => {

        fs.readFile(filename, 'utf8', (error, contents) => {
            if (error) {
                console.error("Página ainda não está em Cache", error)
                resolve(null)
            }

            resolve(contents);
        });
    }

    return new Promise(promiseCallback);
}

const getPageItems = (html) => {


    const promiseCallback = async(resolve) => {

    }

    return new Promise(promiseCallback);
}

const path = "grammar-points/a1/present-simple-forms-of-to-be/1/";
getCachedPage(path).then(getPageItems).catch(console.error);