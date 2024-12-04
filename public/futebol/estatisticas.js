document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.querySelector("#statsTable tbody");

    // Função para buscar dados do servidor
    async function fetchStats() {
        try {
            const response = await fetch("fetch_stats.php");
            const data = await response.json();

            // Atualiza a tabela com os dados recebidos
            tableBody.innerHTML = "";
            data.forEach((player, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${player.nome}</td>
                    <td>${player.vitorias}</td>
                    <td>${player.derrotas}</td>
                    <td>${player.partidas}</td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Erro ao buscar estatísticas:", error);
        }
    }

    // Chama a função para carregar os dados
    fetchStats();
});
