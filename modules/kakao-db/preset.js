module.exports = {
  prefixes: ["", "", "12", "24", "18", "30", "36", "12", "48", "7", "35", "40", "17", "23", "29", "isabel", "kale", "sulli", "van", "merry", "kyle", "james", "maddux", "tony", "hayden", "paul", "elijah", "dorothy", "sally", "bran", "extr.ursra"],
  typeException: ['1', '26'],
  structure: function (myid) {
      return {
          'chat_logs': {
              loc: 'DB1',
              index: '_id',
              salt: ['user_id', ['v', 'enc']],
              execute: {
                  _id: {
                      parse: true
                  },
                  type: {
                      parse: true
                  },
                  message: {
                      decrypt: true
                  },
                  attachment: {
                      decrypt: true,
                      bigParse: true
                  },
                  created_at: {
                      parse: true
                  },
                  deleted_at: {
                      parse: true
                  },
                  client_message_id: {
                      parse: true
                  },
                  supplement: {
                      parse: true
                  },
                  v: {
                      parse: true
                  }
              }
          },
          'friends': {
              loc: 'DB2',
              index: 'id',
              salt: [myid, 'enc'],
              execute: {
                  name: {
                      decrypt: true
                  },
                  profile_image_url: {
                      decrypt: true
                  },
                  full_profile_image_url: {
                      decrypt: true
                  },
                  original_profile_image_url: {
                      decrypt: true
                  },
                  v: {
                      decrypt: true,
                      parse: true
                  }
              },
          },
          'chat_rooms': {
              loc: 'DB1',
              index: 'id',
              salt: ['user_id', ['v', 'enc']],
              execute: {
                  members: {
                      bigParse: true
                  },
                  active_member_ids: {
                      bigParse: true
                  },
                  last_message: {
                      decrypt: true
                  },
                  watermarks: {
                      bigParse: true
                  },
                  v: {
                      decrypt: true,
                      parse: true
                  },
                  meta: {
                      bigParse: true
                  },
                  private_meta: {
                      parse: true
                  },
                  moim_meta: {
                      bigParse: true
                  },
              },
          },
          'open_link': {
              loc: 'DB2',
              index: 'id',
              salt: [null, null],
              execute: {}
          },
      }
  }
}