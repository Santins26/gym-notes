const SUPABASE_URL = "https://ymahhrqlqmrikyoaywoa.supabase.co";
const SUPABASE_KEY = "sb_publishable_ndPt4RNUaerBovPKWNxKEg_0cD6dExU";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const day = document.getElementById("day");
const exercises = document.getElementById("exercises");

const exerciseName = document.getElementById("exerciseName");
const weight = document.getElementById("weight");
const reps = document.getElementById("reps");

const addButton = document.getElementById("add");
const email = document.getElementById("email");
const password = document.getElementById("password");

const signupButton = document.getElementById("signup");
const loginButton = document.getElementById("login");
const logoutButton = document.getElementById("logout");

signupButton.addEventListener("click", async () => {

    const { data, error } = await supabaseClient.auth.signUp({
        email: email.value,
        password: password.value
    });

    if (error) {
        console.error("ERRO AO CADASTRAR:", error);
        alert(error.message);
        return;
    }

    console.log("Usuário criado:", data);

    alert("Conta criada!");
});

loginButton.addEventListener("click", async () => {

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email.value,
        password: password.value
    });

    if (error) {
        console.error("ERRO AO ENTRAR:", error);
        alert(error.message);
        return;
    }

    console.log("Usuário logado:", data.user);

    alert("Login realizado!");
    location.reload();
});

logoutButton.addEventListener("click", async () => {

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.error("ERRO AO SAIR:", error);
        alert(error.message);
        return;
    }

    alert("Você saiu da conta.");
    location.reload();
});

async function renderExercises() {

    const selectedDay = day.value;

    exercises.innerHTML = "";

    if (!selectedDay) {
        return;
    }

    const { data, error } = await supabaseClient
        .from("exercises")
        .select("*")
        .eq("day", selectedDay)
        .order("id")
        .eq("active", true);

    if (error) {
        console.error("ERRO AO BUSCAR:", error);
        alert(`Erro ao buscar exercícios: ${error.message}`);
        return;
    }

    data.forEach(exercise => {

        const div = document.createElement("div");

        div.classList.add("exercise");

        div.innerHTML = ` 
            <h3>${exercise.name}</h3>
            <h3 class="serie1">1 SÉRIE </h3> <br>

            <label>
                
                Peso:
                <input type="number" class="weight-set1">
                kg/lbs
            </label>
            <br>

            <label>
                Repetições:
                <input type="number" class="reps-set1">
                reps
            </label>
            <br>
            <br>

            <h3 class="serie2">2 SÉRIE </h3><br>

            <label>
                
                Peso:
                <input type="number" class="weight-set2">
                kg/lbs
            </label>
            <br>

            <label>
                Repetições:
                <input type="number" class="reps-set2">
                reps
            </label>
            <br><br>

           <button class="save-button" data-id="${exercise.id}">
    Salvar treino
</button>

            <button class="remove-button" data-id="${exercise.id}">
    Remover exercício
</button>
<br> ---------------------------------------------------------------------------------------------------------------------------------------
            <div class="history">
    <h4>Histórico</h4>
</div>
        `;

        exercises.appendChild(div);
        const historyDiv = div.querySelector(".history");

loadHistory(exercise.id, historyDiv);
    });

    async function loadHistory(exerciseId, historyDiv) {

    const { data: workouts, error } = await supabaseClient
        .from("workouts")
        .select(`
            id,
            workout_date,
            workout_sets (
                set_number,
                weight,
                reps
            )
        `)
        .eq("exercise_id", exerciseId)
        .order("workout_date", { ascending: false })
.order("id", { ascending: false })
.limit(1);

    if (error) {
        console.error("ERRO AO BUSCAR HISTÓRICO:", error);
        return;
    }

    historyDiv.innerHTML = "";

    workouts.forEach(workout => {

        const workoutDiv = document.createElement("div");

        const title = document.createElement("p");

        title.textContent = `Ultimo treino: ${workout.workout_date}`;

        workoutDiv.appendChild(title);

        workout.workout_sets
            .sort((a, b) => a.set_number - b.set_number)
            .forEach(set => {

                const item = document.createElement("p");

                item.textContent =
                    `Série ${set.set_number}: ${set.weight} kg × ${set.reps} reps`;

                workoutDiv.appendChild(item);
                
            });

        historyDiv.appendChild(workoutDiv);
    });
}

    const saveButtons = document.querySelectorAll(".save-button");

    saveButtons.forEach(button => {

    button.addEventListener("click", async () => {

        const { data: { user }, error: userError } =
            await supabaseClient.auth.getUser();

        if (userError || !user) {
            alert("Você precisa estar logado.");
            return;
        }

        const exerciseId = button.dataset.id;

        const exerciseDiv = button.parentElement;

    const weightSet1 = Number(
        exerciseDiv.querySelector(".weight-set1").value
    );

    const repsSet1 = Number(
        exerciseDiv.querySelector(".reps-set1").value
    );

    const weightSet2 = Number(
        exerciseDiv.querySelector(".weight-set2").value
    );

    const repsSet2 = Number(
        exerciseDiv.querySelector(".reps-set2").value
    );

    console.log("Exercício:", exerciseId);
    console.log("Série 1:", weightSet1, repsSet1);
    console.log("Série 2:", weightSet2, repsSet2);


          const { data: workout, error } = await supabaseClient
    .from("workouts")
    .insert({
        exercise_id: exerciseId,
        user_id: user.id
    })
    .select()
    .single();

            if (error) {
    console.error("ERRO AO CRIAR TREINO:", error);
    alert(`Erro ao criar treino: ${error.message}`);
    return;
}

           console.log("Treino criado:", workout);
           const { error: set1Error } = await supabaseClient
    .from("workout_sets")
    .insert({
        workout_id: workout.id,
        set_number: 1,
        weight: weightSet1,
        reps: repsSet1
    });

if (set1Error) {
    console.error("ERRO AO SALVAR SÉRIE 1:", set1Error);
    alert(`Erro ao salvar série 1: ${set1Error.message}`);
    return;
}
const { error: set2Error } = await supabaseClient
    .from("workout_sets")
    .insert({
        workout_id: workout.id,
        set_number: 2,
        weight: weightSet2,
        reps: repsSet2
    });

if (set2Error) {
    console.error("ERRO AO SALVAR SÉRIE 2:", set2Error);
    alert(`Erro ao salvar série 2: ${set2Error.message}`);
    return;
}
alert("Treino Salvo");
renderExercises();
        });
    });

    const removeButtons = document.querySelectorAll(".remove-button");

removeButtons.forEach(button => {

    button.addEventListener("click", () => {

        const exerciseId = button.dataset.id;

        removeExercise(exerciseId);

    });

});
}

day.addEventListener("change", renderExercises);

async function removeExercise(id) {

    const { error } = await supabaseClient
        .from("exercises")
         .update({
            active: false
        })
        .eq("id", id);

    if (error) {
        console.error(error);
        alert("Erro ao remover exercício.");
        return;
    }

    renderExercises();
}


addButton.addEventListener("click", async () => {

    const { data: { user }, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !user) {
        alert("Você precisa estar logado.");
        return;
    }

    const selectedDay = day.value;
    


    if (!selectedDay) {
        alert("Selecione um dia primeiro.");
        return;
    }

    const name = exerciseName.value.trim();

    if (!name) {
        alert("Digite o nome do exercício.");
        return;
    }

    const { data: existingExercise, error: searchError } = await supabaseClient
    .from("exercises")
    .select("*")
    .eq("day", selectedDay)
    .eq("name", name)
    .eq("user_id", user.id)
    .maybeSingle();

if (searchError) {
    console.error("ERRO AO PROCURAR EXERCÍCIO:", searchError);
    alert(`Erro ao procurar exercício: ${searchError.message}`);
    return;
}

if (existingExercise) {

    const { error } = await supabaseClient
        .from("exercises")
        .update({
            active: true
        })
        .eq("id", existingExercise.id);

    if (error) {
        console.error("ERRO AO REATIVAR:", error);
        alert(`Erro ao reativar exercício: ${error.message}`);
        return;
    }

} else {

    const { error } = await supabaseClient
        .from("exercises")
       .insert({
    day: selectedDay,
    name: name,
    active: true,
    user_id: user.id
});
    if (error) {
        console.error("ERRO AO CRIAR:", error);
        alert(`Erro ao criar exercício: ${error.message}`);
        return;
    }
}

    exerciseName.value = "";


    renderExercises();
});

renderExercises();