const getPrograms = async () => {
    const response = await fetch('api/programs', {
        method: 'GET'
    })
        .then (res => res.json());

    return response;
}

export default {
    getPrograms,
}