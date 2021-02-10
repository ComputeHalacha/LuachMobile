import React from 'react';
import { Text, View, TouchableHighlight } from 'react-native';
import { Icon } from 'react-native-elements';
import { getGlobals } from '../../Code/GeneralUtils';

export default function AddButton(props) {
    return (
        <TouchableHighlight onPress={() => props.onPress()}>
            <View
                style={{
                    flexDirection: 'row',
                    alignContent: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <Icon
                    size={9}
                    reverse
                    name="add"
                    color={getGlobals().BUTTON_COLOR}
                />
                <Text
                    style={{
                        color: getGlobals().BUTTON_COLOR,
                        fontSize: 12,
                    }}>
                    {props.caption}
                </Text>
            </View>
        </TouchableHighlight>
    );
}
