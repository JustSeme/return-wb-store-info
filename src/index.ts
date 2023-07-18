import express from 'express'
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const port = 3000;



// Изначально хотел сделать лямбда-функцией, чтобы сервер за зря не крутился, но посмотрев на ваш стек, решил лучше на express
app.get('/', async (request, response) => {
    const currency = 'rub'
    const productsIds = '138593051;94340317;94340606;138590435;138607462;94339119;94339244;'
    const storeId = '-1681991'

    const wbResponse = await fetch(`https://card.wb.ru/cards/detail?curr=${currency}&nm=${productsIds}&dest=${storeId}`)
        .then(res => res.json())

    // Сложность алгоритма - O(n)^2, иначе по-моему никак
    const mappedProducts = wbResponse.data.products.map((product) => {
        const mappedSizes = []
        product.sizes.forEach(size => {
            if (size.stocks.length > 0) {
                mappedSizes.push(size.name)
            }
        })

        return {
            Art: product.id,
            sizes: mappedSizes
        }
    })

    response.send(mappedProducts)
    // Сомневаюсь только что это товары именно из Казани, но за склад точно отвечает параметр dest
    // получил значение -1681991 опытным путём - тыкал на товары, где написано, что доставка со склада Казань WB и этот параметр всегда совпадал
    // в api селлера есть эндпоинт чтобы получить все склады wb, но там нужен токен селлера, а как селлер я зарегаться не смог.
});

app.listen(port, () => console.log(`Running on port ${port}`));