const apiRoutes = require('express').Router();
//const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config'); // get our config file
const Repository = require('../repositories/repository');
const repository = new Repository();
const mongodb = require('mongodb');
const connectToDB = require('../db/dbConnection');
const Dictionary = require('../Dictionary/Constants')
var _result = "";

/**
 * @author Dinesh
 */
// TODO: route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/+', (req, res) => {
  const data = req.body;
  if (data == {}) {
    res.json({ message: 'username and password required' });
  }
  var query = {
    emailid: data.emailid
  };
  repository.findByCollection('user', query, {
    _id: 0
  }, function (err, result) {
    if (!err) {
      res.json({ success: false, message: 'email is already registered' });
      return;
    } else {
      repository.insertByCollection('user', data, function (err, result, oldData) {
        if (!err) {
          res.json({ success: true, message: 'User Registration successfully' });
        } else {
          res.json({ success: false, message: 'User Registration failed' });
        }
      })

    }

  })
})


/**
 * @description Insert Scout record data
 * @author Niranjan D
 */
apiRoutes.post('/InsertScoutRecord', function (request, response) {
  //  var  ScoutRecord= { 
  //     "UserId" : "5a5f5afe6ed4e60e88ab6b39",
  //     "ScRId" : "5a5f5d00116fc23f506a0b9f",
  //     "FarmId" : "FRM-4",
  //     "BlockId" : "Blk-2",
  //     "TreeId" : "Tree-9",
  //     "bugimageurl" : "./a1bug12.jpg",
  //     "matchingimgurl" : "./ss32.jpg",
  //     "classficationtype" : "AI",
  //     "bugspertree" : 45.0,
  //      "date" : new Date()
  //  }

  var ScoutRecord = request.body
  var ObjId = new mongodb.ObjectID();
  ScoutRecord._id = ObjId;
  ScoutRecord.ScRId = ObjId.toString();
  repository.insertByCollection('Col_ScoutReport', ScoutRecord, function (err, result, oldData) {
    if (!err) {
      response.json({ success: true, message: 'Scout record added successfully.' });
    } else {
      console.log(JSON.stringify(err));
      response.json({ success: false, message: 'Scout record adding failed' });
    }
  })


})
/**
 * @description Insert User data
 * @author Niranjan D
 */
apiRoutes.post('/AddUser', function (req, res) {
  const _addUserData = req.body;
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.json({ message: 'Please enter user data' });
  } else {
    var query = {
      $or:
        [
          { emailid: _addUserData.emailid },
          { username: _addUserData.username }
        ]
    }
    var _DatatoInsert = {
      UserId: new mongodb.ObjectID().toString(),
      username: _addUserData.username,
      password: _addUserData.password,
      emailid: _addUserData.emailid,
      Role: _addUserData.Role,
      FarmId: _addUserData.FarmId
    };
    repository.findByCollection('Col_Users', query, {
      _id: 0
    }, function (err, result) {
      if (!err) {
        res.json({ success: false, message: 'email or username is already registered' });
        return;
      } else {
        repository.insertByCollection('Col_Users', _DatatoInsert, function (err, result, oldData) {
          if (!err) {
            res.json({ success: true, message: 'User Registration successfully' });
          } else {
            res.json({ success: false, message: 'User Registration failed' });
          }
        })

      }
    })
  }
})

apiRoutes.post('/Farm_Block_Tree', function (req, res) {

  repository.lookup("Col_Farm", function (err, data) {
    if (!err) {
      res.json({ response: data })
      console.log("response: " + data)
    } else {
      console.log("error: " + err)
    }
  })


})
/**
 * @author Dinesh
 */

apiRoutes.post('/authenticate', function (req, res) {

  if (req.body) {

    // check if password matches

    var query = {
      emailid: req.body.emailid,
      password: req.body.password
    };
    console.log(query);
    repository.findByCollectionone('Col_Users', query, {
      _id: 0
    }, function (err, result) {
      if (!err) {
        console.log(result)
        const user = result;
        if (user.password != req.body.password) {
          res.json({ success: false, message: 'Authentication failed. Wrong password.' });
        } else {

          // if user is found and password is right
          // create a token
          var payload = {
            admin: user.name
          }
          // var token = jwt.sign(payload, config.secret, {
          //   expiresIn: 86400 // expires in 24 hours
          // });

          // res.json({
          //   success: true,
          //   message: 'Enjoy your token!',
          //   token: token

          res.json({
            Code: Dictionary.LoginConstants.Login_Success,
            success: true,
            message: 'Enjoy your token!'
          });
        }
      } else {
        res.json({ Code: Dictionary.LoginConstants.Login_Failed, success: false, message: 'email is not registered' });
      }
    })
  }

});
/**
 * @argument emailId
 * @description if userid is valid then token ll be generated and sent to user.
 * @author Niranjan D
 */

apiRoutes.post("/ForgorPassword", function (req, res) {
  if (req.body) {
    var query = {
      emailid: req.body.emailid
    };

    repository.findByCollection('Col_Users', query, {
      _id: 0
    }, function (err, result) {
      if (!err) {
        //User exist.     
        // res.json({ data: result })
        // insert_or_UpdateLoginReset(result)
        var _newToken = "";
        _newToken = new mongodb.ObjectID()
        var query = { UserId: result[0].UserId };
        var data = {
          UserId: result[0].UserId,   // USerId
          ModifiedDate: new Date(),   // Current Date
          Token: _newToken.toString(), // Token to send as email.
          IsTokenExpired: 1

        }

        repository.updateByCollection('Col_UserLoginReset', query, data, true, function (err, result, oldData) {
          if (!err) {
            res.json({ success: true, message: 'Reset login record inserted successfully' });
            console.log('Reset login record inserted successfully');
          } else {

            //res.json({ success: false, message: 'Reset login record inserted failed' });
            console.log('Reset login record inserted failed');
          }
        })

      } else {
        //user not exist
        res.json({ error: err })

      }
    })
  }
});

/**
 * @argument emailId
 * @argument Token
 * @argument UserId
 * @description Validate token via email, which was sent to user.
 * @author Niranjan D
 */

apiRoutes.post("/ValidateToken", function (req, res) {

  if (req.body) {

    var UserEmail = {};
    var query_GetEmailId = {
      emailid: req.body.emailid,
    };
    var _userInfo = {};
    // get UserId from EmailId.
    repository.findByCollectionone("Col_Users", query_GetEmailId, {
      _id: 0,
      UserId: 1
    }, function (err, result) {
      if (!err) {
        _userInfo = result;
      } else {
        console.log(err);
      }
    });
    setTimeout(() => {
      var query = {
        UserId: _userInfo.UserId,
        Token: req.body.Token
      };
      repository.findByCollectionone("Col_UserLoginReset", query, {
        _id: 0
      }, function (err, result) {

        if (!err) {
          var query = { UserId: _userInfo.UserId };
          var NewPassword = "NewPassowrdSample";
          repository.updateByCollection('Col_Users', query,
            {
              $set: { "password": NewPassword }
            }, true, function (err, result, oldData) {
              if (!err) {
                console.log("updated successfully ")
                var flag = 0;
                repository.updateByCollection('Col_UserLoginReset', query,
                  {
                    $set: { "IsTokenExpired": flag }
                  }, true, function (err, result, oldData) {
                    if (!err) {
                      res.json({ success: true, message: 'Password Changed' });
                      console.log("updated successfully ")
                    } else {
                      console.log("updated failed ")
                    }
                  });
              } else {
                console.log("updated failed ")
              }
            });
        } else {
          res.json({ IsTokenValid: false })
        }
      });
    }, 10);

  }
});

/* CRUD for Farm */

//Read Farm
apiRoutes.post('/GetFarmData', function getFarmData(req, res) {
  if (req.body) {
    var _Request = req.body;
    var query = {};
    repository.findByCollection('Col_Farm1', query, {
      "FarmId": 1,
      "Name": 1,
      _id: 0,
    }, function (err, result) {
      if (!err) {
        res.json({ Code: Dictionary.GeneralConstants.RESULTS_FOUND, response: result });
      } else {
        res.json({ code: Dictionary.GeneralConstants.NO_RESULTS_FOUND, err: err });
      }
    });
  }

})

apiRoutes.post("/GetFarmName", function (req, res) {
  if (req.body) {
    var _Request = req.body;
    var query = {
      "FarmId": _Request.FarmId
    }
    repository.findByCollectionone("Col_Farm", query, { "Name": 1, _id: 0 }, function (err, result) {
      !err ? res.json({ Code: Dictionary.GeneralConstants.RESULTS_FOUND, response: result }) : res.json({ Code: Dictionary.GeneralConstants.NO_RESULTS_FOUND, response: "No Results Found" })
    })
  }
})
// Create Farm.

apiRoutes.post("/CreateFarm", function (req, res) {
  /*
  {
      "_id" : ObjectId("5a4cea388f9b9a0f099a6586"),
      "id" : "5a4cea388f9b9a0f099a6585",
      "FarmId" : "FRM-1",
      "Name" : " ",
      "CreatedDate" : ISODate("2018-01-03T14:35:36.096Z"),
      "FarmLocation" : {
          "x" : 255.6,
          "y" : 65.5
      }
  }  
  */
  if (req.body) {
    var _Request = req.body;
    try {
      var objID = new mongodb.ObjectID();
      var FarmQuery = {
        "_id": objID,
        "id": objID.toString(),
        "FarmId": objID.toString(),
        "Name": _Request.Name,
        "CreatedDate": new Date(),
        "FarmLocation": {
          "x": _Request.FarmLocation.x,
          "y": _Request.FarmLocation.y
        }
      }
      repository.insertByCollection('Col_Farm', FarmQuery, function (err, result, oldData) {
        if (!err) {
          res.json({ success: true, message: 'Farm  Registration successfully' });
        } else {
          console.error(err);
          if (err.code == "11000") {
            res.json({ success: false, message: "Duplicate FarmId" });
          } else {
            res.json({ success: false, message: err });
          }

        }
      })

    } catch (error) {
      console.log(error);

    }
  }

})

// Delete Farm.


apiRoutes.post("/DeleteFarm", function (req, res) {
  if (req.body) {
    var _Request = req.body;
    var _DeleteQuery = { "id": _Request.id };
    repository.deleteByCollection("Col_Farm", _DeleteQuery, function (err, data) {
      (!err) ? res.json({ message: "FarmId :" + _Request.id + " Deleted" }) : res.json({ message: "FarmId  not  Deleted :" + err })
    })
  }
})

//update Farm Location

apiRoutes.post("/UpdateFarmLocation", function (req, res) {
  if (req.body) {
    var _Request = req.body;
    var _UpdateQuery = { "id": _Request.id };
    var _UpdateData = {
      $set: {
        "FarmLocation.x": _Request.FarmLocation.x,
        "FarmLocation.y": _Request.FarmLocation.y,
        "CreatedDate": new Date()
      }
    }
    repository.updateByCollection("Col_Farm", _UpdateQuery, _UpdateData, true, function (err, result) {
      !err ? res.json({ success: _Request.id + ": Location updated" }) : res.json({ success: _Request.id + ": updation failed" + err })
    });
  }
})

/**
 * Update Farm Admin
 * @argument  Farmid
 * @argument  UserId
 * @author    Niranjan D
 */
apiRoutes.post("/SetFarmAdmin", function SetFarmAdmin(req, res) {
  if (req.body) {
    var _Request = req.body;
    var _UpdateQuery = { "FarmId": _Request.FarmId };
    var _UserId = _Request.UserId;
    var _UpdateData = {
      $set: {
        "Admin": _UserId
      }
    }
    repository.updateByCollection("Col_Farm", _UpdateQuery, _UpdateData, true, function cbSetFarmData(err, data) {
      (!err) ? (data.result.nModified == 1) ? (res.json({ Farmid: _Request.FarmId + ": Admin updated" })) : res.json({ Farmid: _Request.FarmId + ": Admin not updated!" }) : res.json({ Farmid: _Request.FarmId + ": Updation process not done." })
    })
  }

})

/**
 * CRUD for Block 
 */
// Create Block.

apiRoutes.post("/CreateBlock", function (req, res) {
  /*
  {
    "_id" : ObjectId("5a4cec3b8f9b9a0f099a65a0"),
    "id" : "5a4cec3b8f9b9a0f099a659f",
    "BlockId" : "Blk-1",
    "Name" : " ",
    "CreatedDate" : ISODate("2018-01-03T14:44:11.399Z"),
    "FarmId" : "FRM-1",
    "BlockLocation" : {
        "x" : 255.6,
        "y" : 65.5
    }
}  
  */
  if (req.body) {
    var _Request = req.body;
    try {
      var objID = new mongodb.ObjectID();
      var BlockQuery = {
        "_id": objID,
        "id": objID.toString(),
        "BlockId": objID.toString(),
        "Name": _Request.Name,
        "CreatedDate": new Date(),
        "FarmId": _Request.FarmId,
        "BlockLocation": {
          "x": _Request.BlockLocation.x,
          "y": _Request.BlockLocation.y
        }
      }
      repository.insertByCollection('Col_Block', BlockQuery, function (err, result, oldData) {
        if (!err) {
          res.json({ success: true, message: 'Block  Registration successfully' });
        } else {
          console.error(err);
          if (err.code == "11000") {
            res.json({ success: false, message: "Duplicate BlockId" });
          } else {
            res.json({ success: false, message: err });
          }

        }
      })

    } catch (error) {
      console.log(error);

    }
  }

})
//Read Block
apiRoutes.post('/GetBlockData', function getBlockData(req, res) {
  if (req.body) {
    var _Request = req.body;
    var query = {};
    repository.findByCollection('Col_Block', query, {
      "BlockId": 1,
      "Name": 1,
      _id: 0,
    }, function (err, result) {
      if (!err) {
        res.json({ Code: Dictionary.GeneralConstants.RESULTS_FOUND, response: result });
      } else {
        res.json({ code: Dictionary.GeneralConstants.NO_RESULTS_FOUND, err: err });
      }
    });
  }

})

//update Block Location

apiRoutes.post("/UpdateBlockLocation", function (req, res) {
  if (req.body) {
    var _Request = req.body;
    var _UpdateQuery = { "BlockId": _Request.BlockId };
    var _UpdateData = {
      $set: {
        "Name": _Request.Name,
        "BlockLocation.x": _Request.BlockLocation.x,
        "BlockLocation.y": _Request.BlockLocation.y
      }
    }
    repository.updateByCollection("Col_Block", _UpdateQuery, _UpdateData, true, function (err, result) {
      !err ? res.json({ success: _Request.Name + ": Location updated" }) : res.json({ success: _Request.Name + ": updation failed" + err })
    });
  }
})

// Delete Block.
apiRoutes.post("/DeleteBlock", function (req, res) {
  if (req.body) {
    var _Request = req.body;
    var _DeleteQuery = { "BlockId": _Request.BlockId };
    repository.deleteByCollection("Col_Block", _DeleteQuery, function (err, data) {
      if (!err) {
        data.result.n != 0 ? res.json({ message: "BlockId :" + _Request.BlockId + " Deleted" }) : res.json({ message: "No such Block id Found" });
      } else {
        res.json({ message: "Deleting process Failured" + err })
      }
    })
  }
})


/* CRUD for Tree */
// Create Tree.

apiRoutes.post("/CreateTree", function (req, res) {
  /*
  {
    "_id" : ObjectId("5a4f8809c02c416b94e9e719"),
    "id" : "Tree-7",
    "BlockId" : "Blk-1",
    "BugCount" : 1.0,
    "location" : {
        "x" : 656.65,
        "y" : 98.655
    }
}

  */
  if (req.body) {
    var _Request = req.body;
    try {
      var objID = new mongodb.ObjectID();
      var TreeQuery = {
        "_id": objID,
        "id": objID.toString(),
        "BlockId": _Request.BlockId,
        "BugCount": 1.0,
        "CreatedDate": new Date(),
        "location": {
          "x": _Request.location.x,
          "y": _Request.location.y
        }
      }
      repository.insertByCollection('Col_Tree', TreeQuery, function (err, result, oldData) {
        if (!err) {
          res.json({ success: true, message: 'Tree  Registration successfully' });
        } else {
          console.error(err);
          if (err.code == "11000") {
            res.json({ success: false, message: "Duplicate TreeId" });
          } else {
            res.json({ success: false, message: err });
          }

        }
      })

    } catch (error) {
      console.log(error);

    }
  }

})

//Read Tree
apiRoutes.post('/GetTreeData', function getTreeData(req, res) {
  if (req.body) {
    var _Request = req.body;
    var query = {};
    repository.findByCollection('Col_Tree', query, {
      "id": 1,
      "BugCount": 1,
      _id: 0,
    }, function (err, result) {
      if (!err) {
        res.json({ Code: Dictionary.GeneralConstants.RESULTS_FOUND, response: result });
      } else {
        res.json({ code: Dictionary.GeneralConstants.NO_RESULTS_FOUND, err: err });
      }
    });
  }

})

//update Block Location

apiRoutes.post("/UpdateTreeLocation", function updateTreeLocation(req, res) {
  if (req.body) {
    var _Request = req.body;
    var _UpdateQuery = { "id": _Request.id };
    var _UpdateData = {
      $set: {

        "location.x": _Request.location.x,
        "location.y": _Request.location.y
      }
    }
    repository.updateByCollection("Col_Tree", _UpdateQuery, _UpdateData, true, function (err, result) {
      !err ? res.json({ success: _Request.id + ": Location updated" }) : res.json({ success: _Request.id + ": updation failed" + err })
    });
  }
})

// Delete Block.
apiRoutes.post("/DeleteTree", function DeleteTree(req, res) {
  if (req.body) {
    var _Request = req.body;
    var _DeleteQuery = { "id": _Request.id };
    repository.deleteByCollection("Col_Tree", _DeleteQuery, function (err, data) {
      if (!err) {
        data.result.n != 0 ? res.json({ message: "id :" + _Request.id + " Deleted" }) : res.json({ message: "No such Tree id Found" });
      } else {
        res.json({ message: "Deleting process Failured" + err })
      }
    })
  }
})



/* Aggreagation Portion */
apiRoutes.post('/ScoutSummary', function (req, res) {
  if (req.body) {


    var farmID = req.body.FarmId;
    var pipeline =
      [{
        $match: { "FarmId": farmID }
      },

      {
        $group: {

          _id: "$BlockId",
          "No_of_Trees": { $sum: 1 },
          "BugsPerTree": { $sum: "$bugspertree" }

        }
      }];
    repository.aggregate("Col_ScoutReport", pipeline, function (err, result) {
      if (!err) {
        //   console.log("result: "+result)
        res.json({ response: result })
        var ScoutReportResult = JSON.stringify(result);
        console.log(ScoutReportResult);
      }
      else {
        console.log("error: " + err)
      }
    });
  }
})
var dt = "";
apiRoutes.post('/UserHistory', function (req, res) {
  if (req.body) {
    var _Request = req.body;
    var _UserId = _Request.UserId;
/**
 * @description Get Data from Col_ScoutReport , Col_Farm, Col_Block, Col_Tree.
 * @argument  UserId
 * @description Data Aggregated based on Date and Admin in Farm collections
 */
    var _UserHistoryQuery = [
      // match
      // {
      //   $match: { "UserId": _UserId }

      // },

      //LookUp: Farm
      {
        $lookup: {
          from: "Col_Farm",
          localField: "FarmId",
          foreignField: "FarmId",
          as: "UserFarmData"
        }
      },
      //LookUp: Block
      {
        $lookup: {
          from: "Col_Block",
          localField: "FarmId",
          foreignField: "FarmId",
          as: "BlockData"
        }
      },
      //LookUp: Tree
      {
        $lookup: {
          from: "Col_Tree",
          localField: "BlockId",
          foreignField: "BlockId",
          as: "TreeData"
        }
      },

      {
        $unwind: "$UserFarmData"
      },

      {
        $unwind: "$BlockData"
      },

      {
        $unwind: "$TreeData"
      },
      //group

      {
        $group: {
          _id: { date: "$date" },
          FarmId: { $addToSet: "$UserFarmData.FarmId" },
          FarmName: { $addToSet: "$UserFarmData.Name" },
          BlockId: { $addToSet: "$BlockData.BlockId" },
          BlockName: { $addToSet: "$BlockData.Name" },
          TreeId: { $addToSet: "$TreeData.id" },
          BugCount: { $addToSet: "$TreeData.BugCount" },
        }
      },
      { $unwind: "$FarmName" },
      { $unwind: "$FarmId" },
      { $unwind: "$BlockId" },
      { $unwind: "$BlockName" },
      { $unwind: "$BlockId" },
      { $unwind: "$BlockName" },
      { $unwind: "$TreeId" },
      { $unwind: "$BugCount" },
      {
        $project: {
          _id:0,
          "Date:": "$_id.date",
          "Farm": { "id": "$FarmId", "Name": "$FarmName" },
          "Block": { "id": "$BlockId", "Name": "$BlockName" },
          "Tree": {
            "id": "$TreeId", "BugCount": "$BugCount"
          }
        }
      }

    ]
    repository.aggregate("Col_ScoutReport", _UserHistoryQuery, function (err, result) {
      if (!err) {
        if (result.length > 0) {
          res.json({ Code: Dictionary.GeneralConstants.RESULTS_FOUND, response: result })
        } else {
          res.json({ Code: Dictionary.GeneralConstants.NO_RESULTS_FOUND, response: "No Results Found" })
        }
      } else {
        res.json({ Code: Dictionary.GeneralConstants.ERROR, response: err })
      }
    });
  }
})


//callback Function
function CallBackFunc(ReqData) {
  var _Request = ReqData;
  var query = {
    "FarmId": _Request[0].Farms
  }
  console.log(ReqData);
  repository.findByCollection("Col_Farm", query, { "Name": 1, _id: 0 }, function (err, result) {
    // !err ? res.json({Code: Dictionary.GeneralConstants.RESULTS_FOUND, response: result }) :   res.json({ Code: Dictionary.GeneralConstants.NO_RESULTS_FOUND, response: "No Results Found" })
    !err ? dt = result : dt = "No Result"
  })
}


// TODO: route middleware to verify a token
// apiRoutes.use(function(req, res, next) {

//     // check header or url parameters or post parameters for token
//     var token = req.body.token || req.query.token || req.headers['x-access-token'];

//     // decode token
//     if (token) {

//       // verifies secret and checks exp
//       jwt.verify(token, config.secret, function(err, decoded) {      
//         if (err) {
//           return res.json({ success: false, message: 'Failed to authenticate token.' });    
//         } else {
//           // if everything is good, save to request for use in other routes
//           req.decoded = decoded;    
//           next();
//         }
//       });

//     } else {

//       // if there is no token
//       // return an error
//       return res.status(403).send({ 
//           success: false, 
//           message: 'No token provided.' 
//       });

//     }
//   });
// route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/', function (req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function (req, res) {

  res.json({
    message: 'hi'
  });

});

module.exports = apiRoutes;
