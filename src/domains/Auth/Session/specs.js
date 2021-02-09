const { applySpec, path, ifElse, compose, pipe } = require('ramda')

const responseSigInSpec = applySpec({
  token: compose(path(['generateToken'])),
  userId: path(['id']),
  technicianId: path(['technicianId']),
  username: path(['username']),
  tecnico: path(['tecnico']),
  permissions: pipe(
    ifElse(
      path(['tecnico']),
      applySpec({}),
      pipe(
        ifElse(
          path(['resource']),
          path(['resource']),
          path(['typeAccount', 'resource'])
        ),
        applySpec({
          addCompany: path(['addCompany']),
          addPart: path(['addPart']),
          addAnalyze: path(['addAnalyze']),
          addEquip: path(['addEquip']),
          addEntry: path(['addEntry']),
          addEquipType: path(['addEquipType']),
          tecnico: path(['tecnico']),
          addAccessories: path(['addAccessories']),
          addUser: path(['addUser']),
          addTypeAccount: path(['addTypeAccount']),
          addTec: path(['addTec']),
          addCar: path(['addCar']),
          addMark: path(['addMark']),
          addType: path(['addType']),
          addProd: path(['addProd']),
          addFonr: path(['addFonr']),
          addEntr: path(['addEntr']),
          addKit: path(['addKit']),
          addKitOut: path(['addKitOut']),
          addOutPut: path(['addOutPut']),
          addROs: path(['addROs']),
          addRML: path(['addRML']),
          gerROs: path(['gerROs']),
          delROs: path(['delROs']),
          updateRos: path(['updateRos']),
          addStatus: path(['addStatus']),
          suprimento: path(['suprimento'])
        })
      )
    )
  )
})

module.exports = {
  responseSigInSpec
}
