/**
 * Executa o agendamento de exame 
 * @param {prontuariounificado.AgendarConsulta} agendarConsulta - Transacao de agendamento de consulta
 * @transaction
 */

 async function agendarConsulta(transacao) {
     const namespace = "prontuariounificado";
     console.log("Entrando na transacao de agendar consulta!");

     // valida se data de consulta é maior que hoje
     const dataConsulta = transacao.dataConsulta;
     let dataSistema = new Date();

     if(dataConsulta <= dataSistema) {
         throw new Error("Data do agendamento deve ser maior que hoje!");
     }

     // cria a consulta no blockchain
     const factory = getFactory();
     let   consultaMedica = factory.newResource(namespace, "ConsultaMedica", transacao.idConsulta);

     consultaMedica.dataAgendamento = transacao.dataConsulta;

     consultaMedica.medicoAtendente = factory.newRelationship(namespace, "Medico", transacao.medicoAtendente.getIdentifier());
     consultaMedica.convenioPaciente = factory.newRelationship(namespace, "Convenio", transacao.convenio.getIdentifier());
     consultaMedica.consultaRealizada = false;
     
     const consultaMedicaRegistry = await getAssetRegistry(consultaMedica.getFullyQualifiedType());
     await consultaMedicaRegistry.add(consultaMedica);

     // adiciona a consulta no prontuario do paciente
     const prontuarioRegistry = await getAssetRegistry(namespace + ".ProntuarioPaciente");
     const prontuario = transacao.prontuarioPaciente;

     if(!prontuario.consultasMedicas) {
         prontuario.consultasMedicas = [];
     }
     
     prontuario.consultasMedicas.push(factory.newRelationship(namespace, "ConsultaMedica", consultaMedica.getIdentifier()));
     await prontuarioRegistry.update(prontuario)

 }





 /**
 * Inicializa blockchain com uma estrutura de pacientes/medicos/convenios
 * @param {prontuariounificado.InicializacaoDemo} iniciarDemo - Transacao para demo
 * @transaction
 */
async function iniciarDemo() {

    console.log("INICIAR DEMO chamado!");
     const initData = {
        "medicos": [
            {"cpf": "12345678901" , 
             "nome" : "Dr. Ancelmo" , 
             "endereco" : {
                 "logradouro":"Rua das Merces", 
                 "numero" : "224",
                 "cidade" : "Sao Paulo", 
                 "estado": "SP",
                 "cep" : "18112-655"
             },
             "crm" : "0223445"
            },
            {"cpf": "12345678922" , 
             "nome" : "Dr. Elmo" , 
             "endereco" : {
                 "logradouro":"Rua das Merces", 
                 "numero" : "224",
                 "cidade" : "Sao Paulo", 
                 "estado": "SP",
                 "cep" : "18112-655"
             },
             "crm" : "02234332"
            },
            {"cpf": "09876543211" , 
             "nome" : "Dr. Marcos" , 
             "endereco" : {
                 "logradouro":"Rua das Merces", 
                 "numero" : "224",
                 "cidade" : "Sao Paulo", 
                 "estado": "SP",
                 "cep" : "18112-655"
             },
             "crm" : "234321"
            },
            {"cpf": "111111111111" , 
             "nome" : "Dra. Eliane" , 
             "endereco" : {
                 "logradouro":"Rua das Merces", 
                 "numero" : "224",
                 "cidade" : "Sao Paulo", 
                 "estado": "SP",
                 "cep" : "18112-655"
             },
             "crm" : "221"
            }
        ],
        "pacientes": [
         {   "cpf": "33299448897" , 
             "nome" : "Marcos Tadeu Brisola Vieira" , 
             "endereco" : {
                 "logradouro":"Rua Heitor Penteado", 
                 "numero" : "1900",
                 "cidade" : "Sao Paulo", 
                 "estado": "SP",
                 "cep" : "18015-655"
             }
         },
         {   "cpf": "32213537828" , 
             "nome" : "Ana Beatriz de Queiroz Morelli" , 
             "endereco" : {
                 "logradouro":"Rua Paulista", 
                 "numero" : "357",
                 "cidade" : "Indaiatuba", 
                 "estado": "SP",
                 "cep" : "18400-000"
             }
         }
        ],
        "convenios": [
            {
                "cnpj" : "345.315.001/0001-01",
                "nome" : "NIMED",
                "endereco" : {
                    "logradouro":"Avenida Paulista", 
                    "numero" : "3572",
                    "complemento" : "7. Andar",
                    "cidade" : "Sao Paulo", 
                    "estado": "SP",
                    "cep" : "18400-000"
                 },
                 "registroAns" : "134512"
            },
            {
             "cnpj" : "345.334.001/0001-99",
             "nome" : "DESCOBRA",
             "endereco" : {
                 "logradouro":"Avenida Paulista", 
                 "numero" : "3572",
                 "complemento" : "8. Andar",
                 "cidade" : "Sao Paulo", 
                 "estado": "SP",
                 "cep" : "18400-000"
              },
              "registroAns" : "13123432"
            }
        ],
        "laboratorios" : [
         {
             "cnpj" : "228.334.007/0001-75",
             "nome" : "Labclin",
             "endereco" : {
                 "logradouro":"Rua Paraiso", 
                 "numero" : "357",
                 "cidade" : "Sao Paulo", 
                 "estado": "SP",
                 "cep" : "18400-000"
              },
              "crmResponsavel" : "98476"
            }
        ]
     }

     const factory = getFactory();
     
     /* ==== CONVENIOS ===== */
     const convenioRegistry = await getParticipantRegistry("prontuariounificado.Convenio");
     for(let i=0;i<initData.convenios.length; i++) {
        let convenio = initData.convenios[i];
        console.log("INIT DEMO - Um convenio");
        console.log("Convenio: " + convenio);
        console.log("@CNPJ: " + convenio.cnpj);
        const novoConvenio = factory.newResource("prontuariounificado", "Convenio", convenio.cnpj);
        novoConvenio.nome = convenio.nome;
       
        let endereco = factory.newConcept("prontuariounificado", "Endereco");
        endereco.logradouro = convenio.endereco.logradouro;
        endereco.numero = convenio.endereco.numero;
        if(convenio.endereco.complemento) {
            endereco.complemento = convenio.endereco.complemento;
        }
        endereco.cidade = convenio.endereco.cidade;
        endereco.estado = convenio.endereco.estado;
        endereco.cep    = convenio.endereco.cep;

        novoConvenio.endereco = endereco;
        novoConvenio.registroAns      = convenio.registroAns;

        await convenioRegistry.add(novoConvenio);
     }

     /* ===== MEDICOS ======= */
     const medicoRegistry = await getParticipantRegistry("prontuariounificado.Medico");
     for(let i=0; i<initData.medicos.length; i++) {
         let medico = initData.medicos[i];
         console.log("INIT DEMO - Um medico");
         console.log(medico.cpf);
         const novoMedico = factory.newResource("prontuariounificado", "Medico", medico.cpf);
         novoMedico.nome = medico.nome;
         novoMedico.cpf = medico.cpf;
         let endereco = factory.newConcept("prontuariounificado", "Endereco");
         endereco.logradouro = medico.endereco.logradouro;
         endereco.numero = medico.endereco.numero;
         if(medico.endereco.complemento) {
             endereco.complemento = medico.endereco.complemento;
         }
         endereco.cidade = medico.endereco.cidade;
         endereco.estado = medico.endereco.estado;
         endereco.cep    = medico.endereco.cep;

         novoMedico.endereco = endereco;
         novoMedico.crm      = medico.crm;

         await medicoRegistry.add(novoMedico);

     }
     
    /* ==== LABORATORIOS ===== */
    const laboratorioRegistry = await getParticipantRegistry("prontuariounificado.Laboratorio");
    for(let i=0;i<initData.laboratorios.length; i++) {
       let laboratorio = initData.laboratorios[i];
       console.log("INIT DEMO - Um laboratorio");
       console.log("Laboratorio: " + laboratorio);
       console.log("@CNPJ: " + laboratorio.cnpj);
       const novoLaboratorio = factory.newResource("prontuariounificado", "Laboratorio", laboratorio.cnpj);
       novoLaboratorio.nome = laboratorio.nome;
      
       let endereco = factory.newConcept("prontuariounificado", "Endereco");
       endereco.logradouro = laboratorio.endereco.logradouro;
       endereco.numero = laboratorio.endereco.numero;
       if(laboratorio.endereco.complemento) {
           endereco.complemento = laboratorio.endereco.complemento;
       }
       endereco.cidade = laboratorio.endereco.cidade;
       endereco.estado = laboratorio.endereco.estado;
       endereco.cep    = laboratorio.endereco.cep;

       novoLaboratorio.endereco       = endereco;
       novoLaboratorio.crmResponsavel = laboratorio.crmResponsavel;

       await laboratorioRegistry.add(novoLaboratorio);
    }

    /* ====== PACIENTES ====== */
    const pacienteRegistry = await getParticipantRegistry("prontuariounificado.Paciente");
    const prontuarioRegistry = await getAssetRegistry("prontuariounificado.ProntuarioPaciente");

    for(let i=0; i<initData.pacientes.length; i++) {
       let paciente = initData.pacientes[i];
       console.log("INIT DEMO - Um paciente");
       console.log("PACIENTE CPF: " + paciente.cpf);
       const novoPaciente = factory.newResource("prontuariounificado", "Paciente", paciente.cpf);
       novoPaciente.nome = paciente.nome;
       let endereco = factory.newConcept("prontuariounificado", "Endereco");
       endereco.logradouro = paciente.endereco.logradouro;
       endereco.numero = paciente.endereco.numero;
       if(paciente.endereco.complemento) {
           endereco.complemento = paciente.endereco.complemento;
       }
       endereco.cidade = paciente.endereco.cidade;
       endereco.estado = paciente.endereco.estado;
       endereco.cep    = paciente.endereco.cep;

       novoPaciente.endereco = endereco;

       await pacienteRegistry.add(novoPaciente);

       // cria prontuario

       let idProntuario = paciente.cpf;
       const novoProntuario = factory.newResource("prontuariounificado", "ProntuarioPaciente", idProntuario);
       novoProntuario.paciente = factory.newRelationship("prontuariounificado", "Paciente", novoPaciente.getIdentifier());
       novoProntuario.consultasMedicas = [];
       novoProntuario.solicitacoesExame = [];
       novoProntuario.laudosEmitidos = [];
       novoProntuario.questionarioPaciente = null;

       await prontuarioRegistry.add(novoProntuario);
   }



}
